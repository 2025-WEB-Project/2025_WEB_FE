// src/pages/Present.tsx
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

// MediaPipe
import { Camera } from "@mediapipe/camera_utils";
import {
  FaceLandmarker,
  PoseLandmarker,
  FilesetResolver,
  type NormalizedLandmark,
  type FaceLandmarkerResult,
  type PoseLandmarkerResult,
} from "@mediapipe/tasks-vision";
import { drawLandmarks } from "@mediapipe/drawing_utils";

/* ================= Styled ================= */
const Page = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
const Stage = styled.div`
  flex: 1;
  background: #e5e6e8;
  border-radius: 6px;
  position: relative;
  overflow: hidden;
  border: 1px solid #ddd;
`;
const OutputCanvas = styled.canvas`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 2;
  pointer-events: none;
`;
const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: transparent;
  transform: scaleX(-1);
  z-index: 1;
`;
const Footer = styled.div`
  background: #fff;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 14px 18px;
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  align-items: center;
`;
const Status = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  color: #333;
  font-size: 14px;
`;
const Dot = styled.span<{ $onair?: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $onair }) => ($onair ? "#2ecc71" : "#c1c7cd")};
  display: inline-block;
`;
const StopBtn = styled.button`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: 3px solid #d43c3c;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;
`;
const StopIcon = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #d43c3c;
`;
const StartIcon = styled.span`
  width: 0;
  height: 0;
  border-left: 18px solid #d43c3c;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  display: inline-block;
  margin-left: 6px;
`;
const Right = styled.div``;

/* ============== Constants / Connections ============== */
const SHOW_FACE = true;

// Face connections for drawing
const faceConnections = {
  tesselation: FaceLandmarker.FACE_LANDMARKS_TESSELATION.map(
    (c) => [c.start, c.end] as [number, number]
  ),
  rightIris: FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS.map(
    (c) => [c.start, c.end] as [number, number]
  ),
  leftIris: FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS.map(
    (c) => [c.start, c.end] as [number, number]
  ),
};

// Pose: 눈(1~6), 입(9~10), 어깨(11~12)만 연결
const POSE_LINES: [number, number][] = [
  [1, 2],
  [2, 3],
  [3, 4],
  [4, 5],
  [5, 6],
  [6, 1],
  [9, 10],
  [11, 12],
];

/* ================== Metric helpers ================== */
// 지수평활
const ema = (prev: number, x: number, a = 0.6) => prev + a * (x - prev);
// 라디안↔도
const rad2deg = (r: number) => (r * 180) / Math.PI;
// 수평/수직 기준 각도
const angleTo = (dx: number, dy: number, base: "h" | "v") =>
  base === "h" ? rad2deg(Math.atan2(dy, dx)) : 90 - rad2deg(Math.atan2(dy, dx));

type XY = { x: number; y: number };
// 연결배열(시작/끝) → 고유 인덱스 집합
function indicesFromConnections(conns: [number, number][]) {
  const set = new Set<number>();
  for (const [s, e] of conns) {
    set.add(s);
    set.add(e);
  }
  return [...set.values()];
}
// 특정 인덱스 집합의 평균 좌표
function avgPoint(lm: NormalizedLandmark[], idx: number[]): XY {
  let sx = 0,
    sy = 0,
    n = 0;
  for (const i of idx) {
    const p = lm[i];
    if (!p) continue;
    sx += p.x;
    sy += p.y;
    n++;
  }
  return n ? { x: sx / n, y: sy / n } : { x: 0, y: 0 };
}
// 특정 인덱스 집합의 x-폭
function spanX(lm: NormalizedLandmark[], idx: number[]) {
  let min = Infinity,
    max = -Infinity,
    n = 0;
  for (const i of idx) {
    const p = lm[i];
    if (!p) continue;
    min = Math.min(min, p.x);
    max = Math.max(max, p.x);
    n++;
  }
  return n ? max - min : 0;
}
// 화면 대각선 길이(px)
function screenDiagPx(canvas: HTMLCanvasElement) {
  return Math.hypot(canvas.width, canvas.height);
}

/* ================== Main Component ================== */
export default function Present() {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [onAir, setOnAir] = useState(false);
  const [loading, setLoading] = useState(true);

  // ====== Metric states/refs ======
  const lastVideoTimeRef = useRef(-1);
  const prevFaceLmRef = useRef<NormalizedLandmark[] | null>(null);
  const yawSeriesRef = useRef<{ t0: number; vals: number[] }>({ t0: performance.now(), vals: [] });
  const emaYawBaseRef = useRef(0);

  // 실시간 집계창(1초마다 로그)
  const meterRef = useRef({
    frames: 0,
    // 1) Gaze
    gazeOnFrames: 0,
    // 3) Expression motion
    motionAccum: 0, // per-sec 합
    // 4) Posture quality weight per frame
    postureAccum: 0,
    // last log time
    lastLogTs: performance.now(),
  });

  // 시선 판단에 필요한 인덱스(왼/오 눈, 홍채, 입술/눈/눈썹)
  const leftEyeIdx = useRef<number[]>([]);
  const rightEyeIdx = useRef<number[]>([]);
  const leftIrisIdx = useRef<number[]>([]);
  const rightIrisIdx = useRef<number[]>([]);
  const lipsIdx = useRef<number[]>([]);
  const eyesBrowsIdx = useRef<number[]>([]);

  useEffect(() => {
    // 연결 → 인덱스 세트 추출
    // Eyes
    // FaceLandmarker.FACE_LANDMARKS_LEFT_EYE / RIGHT_EYE / LEFT/RIGHT_EYEBROW / LIPS 연결 배열이 존재
    const L_EYE = FaceLandmarker.FACE_LANDMARKS_LEFT_EYE.map((c) => [c.start, c.end] as [number, number]);
    const R_EYE = FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE.map((c) => [c.start, c.end] as [number, number]);
    const L_BROW = FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW.map((c) => [c.start, c.end] as [number, number]);
    const R_BROW = FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW.map((c) => [c.start, c.end] as [number, number]);
    const LIPS = FaceLandmarker.FACE_LANDMARKS_LIPS.map((c) => [c.start, c.end] as [number, number]);

    leftEyeIdx.current = indicesFromConnections(L_EYE);
    rightEyeIdx.current = indicesFromConnections(R_EYE);
    leftIrisIdx.current = indicesFromConnections(faceConnections.leftIris);
    rightIrisIdx.current = indicesFromConnections(faceConnections.rightIris);
    lipsIdx.current = indicesFromConnections(LIPS);
    eyesBrowsIdx.current = [
      ...new Set([
        ...indicesFromConnections(L_EYE),
        ...indicesFromConnections(R_EYE),
        ...indicesFromConnections(L_BROW),
        ...indicesFromConnections(R_BROW),
      ]),
    ];
  }, []);

  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true);
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );

        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          outputFaceBlendshapes: false,
          numFaces: 1,
        });
        faceLandmarkerRef.current = faceLandmarker;

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
            delegate: "CPU",
          },
          runningMode: "VIDEO",
          numPoses: 1,
          minPoseDetectionConfidence: 0.2,
          minPosePresenceConfidence: 0.2,
          minTrackingConfidence: 0.2,
        });
        poseLandmarkerRef.current = poseLandmarker;

        setLoading(false);
        await startCamera();
      } catch (e) {
        console.error("Initialization failed:", e);
        alert("Failed to load models.");
      }
    };

    initialize();

    return () => {
      stopCamera();
      faceLandmarkerRef.current?.close();
      poseLandmarkerRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startCamera = async () => {
    const video = videoRef.current;
    if (onAir || !video) return;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });

      streamRef.current = stream;
      video.srcObject = stream;

      await new Promise((resolve) => {
        video.onloadedmetadata = () => resolve(video);
      });

      await video.play();

      cameraRef.current = new Camera(video, {
        onFrame: async () => {
          await predictWebcam();
        },
        width: 1280,
        height: 720,
      });

      cameraRef.current.start();
      setOnAir(true);
    } catch (e) {
      console.error(e);
      alert("카메라 권한을 확인해주세요.");
    }
  };

  const stopCamera = () => {
    cameraRef.current?.stop();
    cameraRef.current = null;

    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;

    setOnAir(false);

    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    // reset meters
    meterRef.current = { frames: 0, gazeOnFrames: 0, motionAccum: 0, postureAccum: 0, lastLogTs: performance.now() };
    yawSeriesRef.current = { t0: performance.now(), vals: [] };
    emaYawBaseRef.current = 0;
    prevFaceLmRef.current = null;
  };

  /* ================== Per-frame ================== */
  const predictWebcam = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const faceLandmarker = faceLandmarkerRef.current;
    const poseLandmarker = poseLandmarkerRef.current;
    if (!video || !canvas || !faceLandmarker || !poseLandmarker) return;
    if (video.currentTime === lastVideoTimeRef.current) return;
    if (video.videoWidth === 0) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    lastVideoTimeRef.current = video.currentTime;

    const ts = performance.now();
    const resultsFace: FaceLandmarkerResult = faceLandmarker.detectForVideo(video, ts);
    const resultsPose: PoseLandmarkerResult = poseLandmarker.detectForVideo(video, ts);

    const faceLm = resultsFace.faceLandmarks?.[0] ?? null;
    const poseLm = resultsPose.landmarks?.[0] ?? null;

    /* ---------- 1) GAZE: 카메라 주시 비율 ---------- */
    if (faceLm) {
      const LeyeC = avgPoint(faceLm, leftEyeIdx.current);
      const ReyeC = avgPoint(faceLm, rightEyeIdx.current);
      const LirisC = avgPoint(faceLm, leftIrisIdx.current);
      const RirisC = avgPoint(faceLm, rightIrisIdx.current);
      const wL = spanX(faceLm, leftEyeIdx.current);
      const wR = spanX(faceLm, rightEyeIdx.current);
      const dLx = wL ? Math.abs(LirisC.x - LeyeC.x) / (wL / 2) : 1;
      const dLy = wL ? Math.abs(LirisC.y - LeyeC.y) / (wL / 2) : 1;
      const dRx = wR ? Math.abs(RirisC.x - ReyeC.x) / (wR / 2) : 1;
      const dRy = wR ? Math.abs(RirisC.y - ReyeC.y) / (wR / 2) : 1;
      const isFront = Math.max(dLx, dLy, dRx, dRy) <= 0.35;

      meterRef.current.frames += 1;
      if (isFront) meterRef.current.gazeOnFrames += 1;

      // 2) 흔들림(Yaw) 추적 (눈 중심 벡터)
      const v = { x: ReyeC.x - LeyeC.x, y: ReyeC.y - LeyeC.y };
      const yawDeg = angleTo(v.x, v.y, "h"); // 수평 기준
      emaYawBaseRef.current = ema(emaYawBaseRef.current, yawDeg, 0.2);
      yawSeriesRef.current.vals.push(yawDeg);
    }

    /* ---------- 3) 표정 경직/긴장 (모션량) ---------- */
    if (faceLm && prevFaceLmRef.current) {
      const diag = screenDiagPx(canvas);
      const idxSet = [...new Set([...lipsIdx.current, ...eyesBrowsIdx.current])];
      let sum = 0,
        n = 0;
      for (const i of idxSet) {
        const p = faceLm[i];
        const q = prevFaceLmRef.current[i];
        if (!p || !q) continue;
        const dx = (p.x - q.x) * canvas.width;
        const dy = (p.y - q.y) * canvas.height;
        sum += Math.hypot(dx, dy);
        n++;
      }
      const dt = 1 / (video as any).fps || 1 / 30; // 브라우저가 fps 노출 안하면 30 가정
      const motionPerSec = n ? (sum / n / diag) / dt : 0; // 화면 대각선 대비 초당 비율
      meterRef.current.motionAccum += motionPerSec;
    }
    if (faceLm) prevFaceLmRef.current = faceLm;

    /* ---------- 4) 자세 점수(roll/lean/pitch) ---------- */
    if (poseLm) {
      const Ls = poseLm[11],
        Rs = poseLm[12],
        Lh = poseLm[23],
        Rh = poseLm[24],
        Nose = poseLm[0];
      if (Ls && Rs && Lh && Rh && Nose) {
        const S = { x: (Ls.x + Rs.x) / 2, y: (Ls.y + Rs.y) / 2 };
        const H = { x: (Lh.x + Rh.x) / 2, y: (Lh.y + Rh.y) / 2 };
        const roll = angleTo(Rs.x - Ls.x, Rs.y - Ls.y, "h");
        const lean = angleTo(H.x - S.x, H.y - S.y, "v");
        const pitch = angleTo(Nose.x - S.x, Nose.y - S.y, "v");

        const weight = (a: number) => (Math.abs(a) <= 10 ? 1.0 : Math.abs(a) <= 20 ? 0.6 : 0.2);
        const frameQuality = Math.min(weight(roll), weight(lean), weight(pitch));
        meterRef.current.postureAccum += frameQuality;
      }
    }

    /* ---------- 캔버스 드로잉 ---------- */
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    // pose (눈/입/어깨만)
    if (poseLm) {
      customDrawConnectors(ctx, poseLm, POSE_LINES, { color: "#FFD400", lineWidth: 4 });
      // 포인트도 일부만 찍고 싶으면 filter로 추려서 drawLandmarks 호출
      const filtered = poseLm.filter((_, i) => [1, 2, 3, 4, 5, 6, 9, 10, 11, 12].includes(i));
      drawLandmarks(ctx as any, filtered as any, { color: "#FF2D2D", radius: 3.5 });
    }

    // face
    if (SHOW_FACE && faceLm) {
      customDrawConnectors(ctx, faceLm, faceConnections.tesselation, { color: "#C0C0C070", lineWidth: 1 });
      customDrawConnectors(ctx, faceLm, faceConnections.rightIris, { color: "#00B0FF", lineWidth: 2 });
      customDrawConnectors(ctx, faceLm, faceConnections.leftIris, { color: "#00B0FF", lineWidth: 2 });
    }

    ctx.restore();

    /* ---------- 1초마다 스코어 산출 & 로그 ---------- */
    const now = performance.now();
    if (now - meterRef.current.lastLogTs >= 1000) {
      const secFrames = meterRef.current.frames || 1;

      // 1) gaze score
      const gazeRatio = meterRef.current.gazeOnFrames / secFrames;
      const gazeScore = Math.round(100 * gazeRatio);

      // 2) sway score (yaw frequency)
      const T = (now - yawSeriesRef.current.t0) / 1000; // s (누적)
      let zc = 0;
      let last: number | null = null;
      const A = 3; // deg
      const base = emaYawBaseRef.current;
      for (const v0 of yawSeriesRef.current.vals) {
        const v = v0 - base;
        if (Math.abs(v) < A) continue;
        const s = Math.sign(v);
        if (last !== null && s !== last) zc++;
        last = s;
      }
      const f = T > 0 ? zc / (2 * T) : 0;
      const swayScore = Math.round(100 * Math.exp(-0.7 * f)); // k=0.7

      // 3) expression score (motion)
      const motionPerSec = meterRef.current.motionAccum / secFrames;
      let exprScore = 0;
      const smin = 0.0015,
        smax = 0.012,
        scap = 0.03;
      if (motionPerSec < smin) exprScore = 100 * (motionPerSec / smin);
      else if (motionPerSec <= smax) exprScore = 100;
      else if (motionPerSec <= scap) exprScore = 100 * ((scap - motionPerSec) / (scap - smax));
      else exprScore = 0;
      exprScore = Math.max(0, Math.min(100, Math.round(exprScore)));

      // 4) posture score
      const postureScore = Math.round(100 * (meterRef.current.postureAccum / secFrames));

      // 출력 (원하면 서버 전송 코드로 바꿔도 됨)
      console.log(
        "%c[Metrics 1s]",
        "background:#111;color:#0f0;padding:2px 6px;border-radius:4px",
        {
          gaze: { ratio: gazeRatio.toFixed(2), score: gazeScore },
          sway: { hz: f.toFixed(2), score: swayScore },
          expression: { motionPerSec: Number(motionPerSec.toFixed(4)), score: exprScore },
          posture: { score: postureScore },
          frames: secFrames,
        }
      );

      // 1초 창 리셋
      meterRef.current.frames = 0;
      meterRef.current.gazeOnFrames = 0;
      meterRef.current.motionAccum = 0;
      meterRef.current.postureAccum = 0;
      meterRef.current.lastLogTs = now;

      // 흔들림 시계열은 누적(빈도 안정화 원하면 10초 창만 유지)
      // 여기선 최근 10초만 유지
      const keepMs = 10000;
      if (now - yawSeriesRef.current.t0 > keepMs) {
        yawSeriesRef.current.t0 = now;
        yawSeriesRef.current.vals = [];
      }
    }
  };

  return (
    <Page>
      <Stage>
        <Video ref={videoRef} playsInline muted autoPlay />
        <OutputCanvas ref={canvasRef} />
      </Stage>

      <Footer>
        <Status>
          <Dot $onair={onAir} />
          {loading
            ? "모델 로딩 중..."
            : onAir
            ? "현재 녹화 및 분석이 진행 중입니다."
            : "카메라가 꺼져 있습니다."}
        </Status>
        <StopBtn
          onClick={() => (onAir ? stopCamera() : startCamera())}
          title={onAir ? "카메라 정지" : "카메라 시작"}
          aria-label={onAir ? "카메라 정지" : "카메라 시작"}
          disabled={loading}
        >
          {onAir ? <StopIcon /> : <StartIcon />}
        </StopBtn>
        <Right />
      </Footer>
    </Page>
  );
}

/* ================== Drawing util ================== */
function customDrawConnectors(
  ctx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[],
  lines: [number, number][],
  options: { color: string; lineWidth: number }
) {
  ctx.beginPath();
  ctx.strokeStyle = options.color;
  ctx.lineWidth = options.lineWidth;
  for (const [s, e] of lines) {
    const a = landmarks[s];
    const b = landmarks[e];
    if (!a || !b) continue;
    ctx.moveTo(a.x * ctx.canvas.width, a.y * ctx.canvas.height);
    ctx.lineTo(b.x * ctx.canvas.width, b.y * ctx.canvas.height);
  }
  ctx.stroke();
}