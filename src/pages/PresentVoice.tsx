import React, { useEffect, useRef, useState } from "react";

// 브라우저가 지원하는 SpeechRecognition API 가져오기
// chrome: webkitSpeechRecognition
// 음성을 텍스트로 바꾸는 기본 엔진
const SpeechRecognition: typeof window.SpeechRecognition | undefined = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  
interface VoiceMetrics {
  wpm: number;           // 말속도
  baselineWPM: number;   // 기준 속도
  volumeDB: number;      // 음량
}

// Inc: 특정 시점에 단어가 몇개 늘었는지 기록
// WPM 계산 시 사용
interface Inc {
  time: number;
  n: number;
}

const PresentVoice: React.FC = () => {
  // state 관리
  const [text, setText] = useState("");   // 음성인식된 텍스트 누적 결과
  const [isListening, setIsListening] = useState(false); // 현재 녹음 중인지 상태 확인
  const [metrics, setMetrics] = useState<VoiceMetrics | null>(null);  // 실시간 속도, 음량 수치

  // 속도, 침묵, 음량 경고 문구
  const [speedAlert, setSpeedAlert] = useState("");
  const [silenceAlert, setSilenceAlert] = useState("");
  const [volumeAlert, setVolumeAlert] = useState("");

  // 전체 평균 말 속도 (녹음 종료 후 표시)
  const [avgWPM, setAvgWPM] = useState<number | null>(null);

  // WPM 계산용
  const incrementsRef = useRef<Inc[]>([]);  // 최근 15초 동안 단어가 얼마나 증가했는지 저장
  const prevTotalWordsRef = useRef(0);  // 이전까지 총 단어 수
  const startTimeRef = useRef<number | null>(null); // 인식 시작 시각
  const tickIdRef = useRef<number | null>(null);  // setInterval 타이머 ID

  // baseline 관련 ref
  const baselineWPMRef = useRef(0);  // 10초 단위 평균 WPM
  const fastStartRef = useRef<number | null>(null); // 빠름 감지 시작 시각 (2초 지속되면 경고)

  // 음량 관련 ref
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);
  const baselineVolRef = useRef<number | null>(null);
  const silenceStartRef = useRef<number | null>(null);
  const volChangeStartRef = useRef<number | null>(null);

  // 임계값 설정 (상수로 관리)
  const WINDOW_SEC = 5; 
  const BASELINE_WINDOW = 10;
  const SPEED_UP_RATIO = 1.2; // 기준속도의 1.2배를 넘으면 빠름으로 간주
  const SPEED_HOLD_MS = 2000; // 2초 이상 빠름 상태 유지 시 경고
  const SILENCE_DB_THRESHOLD = -45; // -45db 이하를 조용함으로 판정
  const SILENCE_SEC = 3; // 3초 이상이면 침묵
  const CHECK_INTERVAL = 500;
  const COMPARE_AFTER_SEC = 15; // 시작 후 15초부터 속도 비교 시작
  const VOLUME_DIFF_RATIO = 0.5; // 볼륨이 ±50% 이상 변동 시 경고
  const VOL_HOLD_MS = 2000; // 2초 이상 지속 시 경고

  // 음성 인식
  const startListening = async () => {
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    // 한국어 인식
    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      // 인식된 텍스트를 text state에 저장
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setText(transcript);

      // 공백으로 나눈 단어 수 계산
      const totalWords = transcript.trim().split(/\s+/).filter(Boolean).length;
      
      const now = Date.now();
      if (!startTimeRef.current) startTimeRef.current = now;

      // 이전과 비교해서 증가한 단어 수 저장
      const delta = Math.max(0, totalWords - prevTotalWordsRef.current);
      prevTotalWordsRef.current = totalWords;

      if (delta > 0) {
        incrementsRef.current.push({ time: now, n: delta });
      }

      // 최근 15초 내 데이터만 유지
      incrementsRef.current = incrementsRef.current.filter(
        (e) => now - e.time <= 15000
      );
    };

    recognition.onend = () => {
      // 인식이 끝나고 평균 WPM 계산
      setIsListening(false);
      if (startTimeRef.current) {
        const elapsedMin = Math.max(
          0.001,
          (Date.now() - startTimeRef.current) / 60000
        );
        const totalWords =
          incrementsRef.current.reduce((s, e) => s + e.n, 0) +
          prevTotalWordsRef.current;
        setAvgWPM(totalWords / elapsedMin);
      }
    };

    // 마이크 초기화
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioContextRef.current = new AudioContext();
      analyserRef.current = audioContextRef.current.createAnalyser();
      const source = audioContextRef.current.createMediaStreamSource(stream);
      analyserRef.current.fftSize = 256;
      dataArrayRef.current = new Float32Array(analyserRef.current.fftSize);
      source.connect(analyserRef.current);
    } catch (err) {
      console.error("마이크 접근 실패:", err);
      alert("마이크 접근에 실패했습니다.");
      return;
    }

    recognition.start();
    setIsListening(true);
    setSpeedAlert("");
    setSilenceAlert("");
    setVolumeAlert("");
    setAvgWPM(null);

    incrementsRef.current = [];
    prevTotalWordsRef.current = 0;
    startTimeRef.current = null;
    baselineWPMRef.current = 0;
    baselineVolRef.current = null;
    fastStartRef.current = null;
    silenceStartRef.current = null;
    volChangeStartRef.current = null;

    // 타이머 시작
    if (tickIdRef.current) window.clearInterval(tickIdRef.current);
    tickIdRef.current = window.setInterval(recompute, CHECK_INTERVAL) as unknown as number;
  };

  // 녹음 중지
  const stopListening = () => {
    setIsListening(false);
    if (tickIdRef.current) {
      window.clearInterval(tickIdRef.current);
      tickIdRef.current = null;
    }
    if (audioContextRef.current) {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
  };

  // 실시간 계산
  const recompute = () => {
    const now = Date.now();

    // 1. 음량 측정 (RMS -> dB)
    let volumeDB = -100;
    if (analyserRef.current && dataArrayRef.current) {
      analyserRef.current.getFloatTimeDomainData(dataArrayRef.current);
      const rms = Math.sqrt(
        dataArrayRef.current.reduce((s, v) => s + v * v, 0) /
          dataArrayRef.current.length
      );
      volumeDB = 20 * Math.log10(rms + 1e-8);
    }

    // 2. 데시벨 기반 침묵 감지
    if (volumeDB < SILENCE_DB_THRESHOLD) {
      if (!silenceStartRef.current) silenceStartRef.current = now;
      const silenceDur = (now - silenceStartRef.current) / 1000;
      if (silenceDur >= SILENCE_SEC) {
        if (!silenceAlert) setSilenceAlert("침묵이 길어지고 있습니다.");
      }
    } else {
      silenceStartRef.current = null;
    }

    // 3. 말속도 계산
    // 최근 5초 동안 말한 단어수 X 12 = WPM
    const sumWords = (from: number, to: number) =>
      incrementsRef.current
        .filter((e) => e.time >= from && e.time < to)
        .reduce((s, e) => s + e.n, 0);

    // 4. 기준선 WPM
    // 최근 10초 평균을 EMA(지수평활)로 업데이트    
    const wordsRecent = sumWords(now - WINDOW_SEC * 1000, now);
    const instantWPM = (wordsRecent / WINDOW_SEC) * 60;

    const wordsBaseline = sumWords(now - BASELINE_WINDOW * 1000, now);
    const baselineWPM = (wordsBaseline / BASELINE_WINDOW) * 60;

    // baseline 업데이트
    if (baselineWPMRef.current === 0)
      baselineWPMRef.current = baselineWPM;
    else
      baselineWPMRef.current =
        baselineWPMRef.current * 0.9 + baselineWPM * 0.1;

    const elapsedSec =
      startTimeRef.current ? (now - startTimeRef.current) / 1000 : 0;
    const canCompare = elapsedSec >= COMPARE_AFTER_SEC;

    // 5. 말 속도 감지
    if (canCompare) {
      const fastCondition =
        instantWPM > baselineWPMRef.current * SPEED_UP_RATIO &&
        baselineWPMRef.current > 0;

      if (fastCondition) {
        if (!fastStartRef.current) fastStartRef.current = now;
        const held = now - fastStartRef.current;
        if (held >= SPEED_HOLD_MS) {
          setSpeedAlert("말이 빨라지고 있습니다. 속도를 조절해주세요.");
          fastStartRef.current = null;
        }
      } else {
        fastStartRef.current = null;
      }

      // 6. 음량 안정성 감지
      if (baselineVolRef.current == null) baselineVolRef.current = Math.pow(10, volumeDB / 20);
      const volLinear = Math.pow(10, volumeDB / 20);
      baselineVolRef.current =
        baselineVolRef.current * 0.9 + volLinear * 0.1;

      const diffRatio =
        Math.abs(volLinear - baselineVolRef.current) /
        (baselineVolRef.current + 1e-6);

      if (diffRatio > VOLUME_DIFF_RATIO) {
        if (!volChangeStartRef.current) volChangeStartRef.current = now;
        const held = now - volChangeStartRef.current;
        if (held >= VOL_HOLD_MS) {
          setVolumeAlert("음량이 불안정 합니다.");
          volChangeStartRef.current = null;
        }
      } else {
        volChangeStartRef.current = null;
      }
    }

    // 화면 표시 갱신
    setMetrics({
      wpm: instantWPM,
      baselineWPM: baselineWPMRef.current,
      volumeDB,
    });
  };

  // 속도/음량 경고 자동 해제
  useEffect(() => {
    if (!speedAlert && !volumeAlert) return;
    const timer = setTimeout(() => {
      setSpeedAlert("");
      setVolumeAlert("");
    }, 3000);
    return () => clearTimeout(timer);
  }, [speedAlert, volumeAlert]);

  // 침묵 메시지 1.5초 뒤 자동 해제
  useEffect(() => {
    if (!silenceAlert) return;
    const timer = setTimeout(() => setSilenceAlert(""), 1500);
    return () => clearTimeout(timer);
  }, [silenceAlert]);

  useEffect(() => {
    return () => {
      if (tickIdRef.current) window.clearInterval(tickIdRef.current);
      if (audioContextRef.current) audioContextRef.current.close();
    };
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "Pretendard", lineHeight: 1.6 }}>
      <h2>실시간 말하기 분석 (데시벨 기반 침묵 + 안정화 음량)</h2>

      <button
        onClick={isListening ? stopListening : startListening}
        style={{
          background: isListening ? "#FF5050" : "#007BFF",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: 6,
          border: "none",
          cursor: "pointer",
          marginBottom: 15,
        }}
      >
        {isListening ? "🛑 중지" : "🎤 시작"}
      </button>

      <div
        style={{
          padding: 15,
          background: "#f9f9f9",
          borderRadius: 8,
          border: "1px solid #ddd",
          minHeight: 100,
        }}
      >
        <b>🗣️ 인식된 말:</b>
        <p style={{ marginTop: 10, color: "#333" }}>{text || "..."}</p>
      </div>

      {metrics && (
        <div style={{ marginTop: 25 }}>
          <h3>📊 실시간 지표</h3>
          <ul>
            <li><b>현재 말속도:</b> {metrics.wpm.toFixed(1)} WPM</li>
            <li><b>기준 평균속도:</b> {metrics.baselineWPM.toFixed(1)} WPM</li>
            <li><b>현재 음량:</b> {metrics.volumeDB.toFixed(1)} dB</li>
          </ul>

          {speedAlert && (
            <p style={{ color: "red", fontWeight: "bold", marginTop: 10 }}>
              {speedAlert}
            </p>
          )}
          {volumeAlert && (
            <p style={{ color: "purple", fontWeight: "bold", marginTop: 6 }}>
              {volumeAlert}
            </p>
          )}
          {silenceAlert && (
            <p style={{ color: "orange", fontWeight: "bold", marginTop: 6 }}>
              {silenceAlert}
            </p>
          )}
        </div>
      )}

      {avgWPM && (
        <div style={{ marginTop: 25 }}>
          <h3>📈 발표 종료 결과</h3>
          <p>평균 말속도: <b>{avgWPM.toFixed(1)} WPM</b></p>
        </div>
      )}
    </div>
  );
};

export default PresentVoice;
