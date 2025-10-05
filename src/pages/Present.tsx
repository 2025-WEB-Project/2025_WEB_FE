// src/pages/Present.tsx
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

// MediaPipe
import { Camera } from "@mediapipe/camera_utils";
import {
  FaceLandmarker,
  PoseLandmarker,
  FilesetResolver,
} from "@mediapipe/tasks-vision";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { drawLandmarks } from "@mediapipe/drawing_utils";

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

const SHOW_FACE = true; 


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

const POSE_LINES: [number, number][] = [
  [0, 1],
  [1, 2],
  [2, 3],
  [3, 7],
  [0, 4],
  [4, 5],
  [5, 6],
  [6, 8],
  [9, 10],
  [11, 12],
  [11, 13],
  [13, 15],
  [15, 17],
  [15, 19],
  [15, 21],
  [17, 19],
  [12, 14],
  [14, 16],
  [16, 18],
  [16, 20],
  [16, 22],
  [18, 20],
  [11, 23],
  [12, 24],
  [23, 24],
  [23, 25],
  [24, 26],
  [25, 27],
  [26, 28],
  [27, 29],
  [28, 30],
  [29, 31],
  [30, 32],
  [27, 31],
  [28, 32],
];

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


export default function Present() {
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cameraRef = useRef<Camera | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [onAir, setOnAir] = useState(false);
  const [loading, setLoading] = useState(true);

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
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputFaceBlendshapes: false,
          numFaces: 1,
        });
        faceLandmarkerRef.current = faceLandmarker;

        // 감지 임계값 완화
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath:
              "https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_full/float16/1/pose_landmarker_full.task",
            delegate: "GPU",
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
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // 프레임 중복 처리 방지
  const lastVideoTimeRef = useRef(-1);

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

    const resultsFace = faceLandmarker.detectForVideo(video, ts);
    const resultsPose = poseLandmarker.detectForVideo(video, ts);

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    // 비디오를 CSS로 좌우반전했으니, 캔버스도 동일하게 반전
    ctx.scale(-1, 1);
    ctx.translate(-canvas.width, 0);

    // ---- Pose (전신) ----
    const poseArrays =
      (resultsPose as any).landmarks ??
      (resultsPose as any).poseLandmarks; 

    if (Array.isArray(poseArrays) && poseArrays.length > 0) {
      const poseLm = poseArrays[0] as NormalizedLandmark[];


      customDrawConnectors(ctx, poseLm as any, POSE_LINES, {
        color: "#FFD400",
        lineWidth: 4,
      });


      drawLandmarks(ctx as any, poseLm as any, { color: "#FF2D2D", radius: 3.5 });
    } else {
      console.debug("Pose not detected", {
        videoW: video.videoWidth,
        videoH: video.videoHeight,
        streamActive: !!video.srcObject,
        time: ts,
      });
    }

    // ---- Face (옵션) ----
    if (SHOW_FACE && resultsFace.faceLandmarks && resultsFace.faceLandmarks.length > 0) {
      const faceLm = resultsFace.faceLandmarks[0];
      customDrawConnectors(
        ctx,
        faceLm,
        faceConnections.tesselation,
        { color: "#C0C0C070", lineWidth: 1 }
      );
      customDrawConnectors(
        ctx,
        faceLm,
        faceConnections.rightIris,
        { color: "#00B0FF", lineWidth: 2 }
      );
      customDrawConnectors(
        ctx,
        faceLm,
        faceConnections.leftIris,
        { color: "#00B0FF", lineWidth: 2 }
      );
    }

    ctx.restore();
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
            ? "현재 녹화 및 녹음이 진행 되고 있습니다"
            : "카메라가 꺼져 있습니다"}
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
