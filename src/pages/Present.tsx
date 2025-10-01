import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Camera } from "@mediapipe/camera_utils";
import { FaceLandmarker, PoseLandmarker, FilesetResolver } from "@mediapipe/tasks-vision";
import type { NormalizedLandmark } from "@mediapipe/tasks-vision";
import { drawConnectors, drawLandmarks } from "@mediapipe/drawing_utils";

// Styled Components 정의
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
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: transparent;
  transform: scaleX(-1); /* 거울 모드 */
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

// 얼굴 랜드마크 연결선 정보 (상수)
const connections = {
  tesselation: FaceLandmarker.FACE_LANDMARKS_TESSELATION.map(conn => [conn.start, conn.end]),
  rightEye: FaceLandmarker.FACE_LANDMARKS_RIGHT_EYE.map(conn => [conn.start, conn.end]),
  rightEyebrow: FaceLandmarker.FACE_LANDMARKS_RIGHT_EYEBROW.map(conn => [conn.start, conn.end]),
  rightIris: FaceLandmarker.FACE_LANDMARKS_RIGHT_IRIS.map(conn => [conn.start, conn.end]),
  leftEye: FaceLandmarker.FACE_LANDMARKS_LEFT_EYE.map(conn => [conn.start, conn.end]),
  leftEyebrow: FaceLandmarker.FACE_LANDMARKS_LEFT_EYEBROW.map(conn => [conn.start, conn.end]),
  leftIris: FaceLandmarker.FACE_LANDMARKS_LEFT_IRIS.map(conn => [conn.start, conn.end]),
  faceOval: FaceLandmarker.FACE_LANDMARKS_FACE_OVAL.map(conn => [conn.start, conn.end]),
  lips: FaceLandmarker.FACE_LANDMARKS_LIPS.map(conn => [conn.start, conn.end]),
};

// [수정 1] POSE_CONNECTIONS를 상수로 직접 정의하여 타입 에러를 해결합니다.
const POSE_CONNECTIONS = [
    { start: 0, end: 1 }, { start: 1, end: 2 }, { start: 2, end: 3 }, { start: 3, end: 7 },
    { start: 0, end: 4 }, { start: 4, end: 5 }, { start: 5, end: 6 }, { start: 6, end: 8 },
    { start: 9, end: 10 }, { start: 11, end: 12 }, { start: 11, end: 13 },
    { start: 13, end: 15 }, { start: 15, end: 17 }, { start: 15, end: 19 },
    { start: 15, end: 21 }, { start: 17, end: 19 }, { start: 12, end: 14 },
    { start: 14, end: 16 }, { start: 16, end: 18 }, { start: 16, end: 20 },
    { start: 16, end: 22 }, { start: 18, end: 20 }, { start: 11, end: 23 },
    { start: 12, end: 24 }, { start: 23, end: 24 }, { start: 23, end: 25 },
    { start: 24, end: 26 }, { start: 25, end: 27 }, { start: 26, end: 28 },
    { start: 27, end: 29 }, { start: 28, end: 30 }, { start: 29, end: 31 },
    { start: 30, end: 32 }, { start: 27, end: 31 }, { start: 28, end: 32 }
];

// 얼굴 그리기를 위한 커스텀 헬퍼 함수
function customDrawConnectors(
  canvasCtx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[], // 'any[]' 대신 'NormalizedLandmark[]' 사용
  connections: number[][],
  options: { color: string; lineWidth: number }
) {
  canvasCtx.beginPath();
  canvasCtx.strokeStyle = options.color;
  canvasCtx.lineWidth = options.lineWidth;
  for (const connection of connections) {
    const start = landmarks[connection[0]];
    const end = landmarks[connection[1]];
    if (start && end) {
      const startX = start.x * canvasCtx.canvas.width;
      const startY = start.y * canvasCtx.canvas.height;
      const endX = end.x * canvasCtx.canvas.width;
      const endY = end.y * canvasCtx.canvas.height;
      canvasCtx.moveTo(startX, startY);
      canvasCtx.lineTo(endX, endY);
    }
  }
  canvasCtx.stroke();
}

// React 컴포넌트
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
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputFaceBlendshapes: true,
          numFaces: 1,
        });
        faceLandmarkerRef.current = faceLandmarker;

        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
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
      const stream = await navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720, facingMode: "user" }, audio: false });
      video.srcObject = stream;
      await new Promise((resolve) => { video.onloadedmetadata = () => { resolve(video); }; });
      video.play();
      cameraRef.current = new Camera(video, { onFrame: async () => { await predictWebcam(); }, width: 1280, height: 720 });
      cameraRef.current.start();
      setOnAir(true);
    } catch (e) {
      console.error(e);
      alert("Please check camera permissions.");
    }
  };

  const stopCamera = () => {
    cameraRef.current?.stop();
    cameraRef.current = null;
    if (videoRef.current) {
      videoRef.current.pause();
      const stream = videoRef.current.srcObject as MediaStream;
      stream?.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setOnAir(false);
    if (canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  let lastVideoTime = -1;
   const predictWebcam = async () => {
   const video = videoRef.current;
   const canvas = canvasRef.current;
   const faceLandmarker = faceLandmarkerRef.current;
   const poseLandmarker = poseLandmarkerRef.current;

   if (!video || !canvas || !faceLandmarker || !poseLandmarker || video.currentTime === lastVideoTime) {
     return;
   }
   if (video.videoWidth === 0) return;

   canvas.width = video.videoWidth;
   canvas.height = video.videoHeight;
   lastVideoTime = video.currentTime;
   const startTimeMs = performance.now();

   const resultsFace = faceLandmarker.detectForVideo(video, startTimeMs);
   const resultsPose = poseLandmarker.detectForVideo(video, startTimeMs);

   const canvasCtx = canvas.getContext("2d");
   if (canvasCtx) {
     canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
     canvasCtx.save();
     canvasCtx.scale(-1, 1);
     canvasCtx.translate(-canvas.width, 0);

     // 상반신 그리기
     if (resultsPose.landmarks && resultsPose.landmarks.length > 0) {
       const poseLandmarks = resultsPose.landmarks[0];

        // [수정 2] 'PoseLandmarker.POSE_CONNECTIONS' 대신 직접 정의한 상수를 사용합니다.
        // 이미지와 유사하게 노란색 선으로 변경합니다.
        drawConnectors(canvasCtx, poseLandmarks, POSE_CONNECTIONS, { color: '#FFFF00', lineWidth: 5 });

        // 얼굴 부분(인덱스 0-10)을 제외한 몸통에만 점을 그립니다.
        const bodyLandmarks = poseLandmarks.filter((_, index) => index > 10);
        drawLandmarks(canvasCtx, bodyLandmarks, { color: '#FF0000', radius: 4 });
      }


     // 얼굴 그리기 (기존 코드 유지)
     if (resultsFace.faceLandmarks && resultsFace.faceLandmarks.length > 0) {
       const faceLandmarks = resultsFace.faceLandmarks[0];
       customDrawConnectors(canvasCtx, faceLandmarks, connections.tesselation as number[][], { color: "#C0C0C070", lineWidth: 1 });
       customDrawConnectors(canvasCtx, faceLandmarks, connections.rightIris as number[][], { color: "#00B0FF", lineWidth: 2 });
       customDrawConnectors(canvasCtx, faceLandmarks, connections.leftIris as number[][], { color: "#00B0FF", lineWidth: 2 });
     }
     
     canvasCtx.restore();
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
          {loading ? "모델 로딩 중..." : onAir ? "카메라 작동 중" : "카메라 꺼짐"}
        </Status>
        <StopBtn
          onClick={() => (onAir ? stopCamera() : startCamera())}
          title={onAir ? "정지" : "시작"}
          aria-label={onAir ? "정지" : "시작"}
          disabled={loading}
        >
          {onAir ? <StopIcon /> : <StartIcon />}
        </StopBtn>
        <Right />
      </Footer>
    </Page>
  );
}