import React, { useEffect, useState, useRef } from "react";

const SpeechRecognition: typeof window.SpeechRecognition | undefined =
  (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

interface VoiceMetrics {
  wpm: number; // Words per minute
  volumeMean: number;
  volumeStability: number;
  silenceRatio: number;
}

interface VolumeSample {
  db: number;
  time: number;
}

const PresentVoice: React.FC = () => {
  const [text, setText] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [metrics, setMetrics] = useState<VoiceMetrics | null>(null);

  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataArrayRef = useRef<Float32Array | null>(null);

  // 단어 수 계산용
  const wordCountRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  // 음량 안정성 계산 간격
  const lastStabilityUpdateRef = useRef<number>(0);

  // 🎤 음성 인식 시작
  const startListening = () => {
    if (!SpeechRecognition) {
      alert("이 브라우저는 음성 인식을 지원하지 않습니다.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "ko-KR";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      const transcript = Array.from(event.results)
        .map((r) => r[0].transcript)
        .join("");
      setText(transcript);

      const words = transcript.trim().split(/\s+/).filter((w) => w.length > 0);
      wordCountRef.current = words.length;

      if (!startTimeRef.current) startTimeRef.current = Date.now();
      const elapsedMin = (Date.now() - startTimeRef.current) / 60000;
      const wpm = words.length / Math.max(elapsedMin, 0.01);

      setMetrics((prev) => ({
        ...(prev || {
          volumeMean: 0,
          volumeStability: 0,
          silenceRatio: 0,
        }),
        wpm,
      }));
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
    setIsListening(true);
  };

  const stopListening = () => {
    setIsListening(false);
    audioContextRef.current?.close();
  };

  // 🎚️ 음향 분석 (실시간)
  useEffect(() => {
    if (!isListening) return;

    let audioCtx: AudioContext;
    let source: MediaStreamAudioSourceNode;
    let animationId: number;
    let silenceCount = 0;
    let frame = 0;
    const volumeHistory: VolumeSample[] = [];

    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioCtx = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      source = audioCtx.createMediaStreamSource(stream);

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 2048;
      const dataArray = new Float32Array(analyser.fftSize);

      audioContextRef.current = audioCtx;
      analyserRef.current = analyser;
      dataArrayRef.current = dataArray;
      source.connect(analyser);

      const detectMetrics = () => {
        analyser.getFloatTimeDomainData(dataArray);
        frame++;

        // RMS 계산
        const rms = Math.sqrt(
          dataArray.reduce((sum, x) => sum + x * x, 0) / dataArray.length
        );
        const db = 20 * Math.log10(rms + 1e-8);

        // --- [실시간 평균] ---
        volumeHistory.push({ db, time: Date.now() });
        if (volumeHistory.length > 1800) volumeHistory.shift(); // 약 30초 (60fps * 30초)

        // 평균 음량 (최근 1초)
        const recent1s = volumeHistory.filter(
          (v) => Date.now() - v.time < 1000
        );
        const mean =
          recent1s.reduce((a, b) => a + b.db, 0) /
          Math.max(recent1s.length, 1);

        // 침묵 감지
        const silenceThreshold = -55;
        if (db < silenceThreshold) silenceCount++;

        const silenceRatio = Math.min(100, (silenceCount / frame) * 100);

        // --- [음량 안정성: 10초 단위로만 갱신] ---
        let longStd = metrics?.volumeStability ?? 0;
        const now = Date.now();
        if (now - lastStabilityUpdateRef.current >= 10000) {
          const longWindow = volumeHistory.map((v) => v.db);
          const longMean =
            longWindow.reduce((a, b) => a + b, 0) /
            Math.max(longWindow.length, 1);
          const longVar =
            longWindow.reduce((s, x) => s + (x - longMean) ** 2, 0) /
            Math.max(longWindow.length, 1);
          longStd = Math.sqrt(longVar);
          lastStabilityUpdateRef.current = now;
        }

        // 💡 실시간 갱신
        setMetrics((prev) => ({
          ...(prev || { wpm: 0 }),
          volumeMean: mean,
          volumeStability: longStd,
          silenceRatio,
        }));

        animationId = requestAnimationFrame(detectMetrics);
      };

      detectMetrics();
    })();

    return () => {
      cancelAnimationFrame(animationId);
      audioContextRef.current?.close();
    };
  }, [isListening]);

  return (
    <div style={{ padding: "20px", fontFamily: "Pretendard", lineHeight: 1.6 }}>
      <h2>🎙️ 실시간 말하기 분석</h2>

      <button
        onClick={isListening ? stopListening : startListening}
        style={{
          background: isListening ? "#FF5050" : "#007BFF",
          color: "#fff",
          padding: "10px 20px",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          marginBottom: "15px",
        }}
      >
        {isListening ? "🛑 중지" : "🎤 시작"}
      </button>

      <div
        style={{
          padding: "15px",
          background: "#f9f9f9",
          borderRadius: "8px",
          border: "1px solid #ddd",
          minHeight: "100px",
        }}
      >
        <b>🗣️ 인식된 말:</b>
        <p style={{ marginTop: "10px", color: "#333" }}>{text || "..."}</p>
      </div>

      {metrics && (
        <div style={{ marginTop: "25px" }}>
          <h3>📊 실시간 음성 지표</h3>
          <ul>
            <li>
              <b>말속도 (WPM):</b> {metrics.wpm.toFixed(1)} 단어/분
            </li>
            <li>
              <b>음량 안정성 (10초 단위):</b> ±{metrics.volumeStability.toFixed(2)} dB
            </li>
            <li>
              <b>침묵 비율:</b> {metrics.silenceRatio.toFixed(1)} %
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default PresentVoice;
