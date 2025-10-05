import { useEffect, useRef, useState } from "react";
import styled from "styled-components";

// 미디어파이프 import
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
  
  /* 거울 모드 */
  transform: scaleX(-1);
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

// 몸 랜드마크 정보 (상수)
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

// Canvas 위에 얼굴 랜드마크를 그려주는 함수
function customDrawConnectors(
  canvasCtx: CanvasRenderingContext2D,
  landmarks: NormalizedLandmark[], // {x, y, z} 좌표 목록 (x와 y는 0~1 사이의 비율값)
  connections: number[][], // 두 점을 연걸하는 인덱스 쌍 리스트
  options: { color: string; lineWidth: number } // 선의 색상과 두께
) {
  // 1. 그리기 준비
  canvasCtx.beginPath();
  canvasCtx.strokeStyle = options.color;
  canvasCtx.lineWidth = options.lineWidth;

  // 2. 모든 연결 쌍 순회
  // connection 구조: [시작점 인덱스, 끝점 인덱스]
  for (const connection of connections) {
    const start = landmarks[connection[0]];
    const end = landmarks[connection[1]];

    if (start && end) {
      // 3. 좌표 변환 (정규화 된 것 -> 실제 좌표)
      // x와 y는 0~1 사이의 비율값이기 때문  
      const startX = start.x * canvasCtx.canvas.width;
      const startY = start.y * canvasCtx.canvas.height;
      const endX = end.x * canvasCtx.canvas.width;
      const endY = end.y * canvasCtx.canvas.height;

      // 4. 선 그리기
      canvasCtx.moveTo(startX, startY);
      canvasCtx.lineTo(endX, endY);
    }
  }

  // 5. 경로 출력
  canvasCtx.stroke();
}

// React 컴포넌트
export default function Present() {
  // 얼굴 랜드마크 모델 객체 저장
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  // 포즈 랜드마크 모델 객체 저장
  const poseLandmarkerRef = useRef<PoseLandmarker | null>(null);

  // 웹캠 영상 표시용
  const videoRef = useRef<HTMLVideoElement | null>(null);
  // 랜드마크 시각화용
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // 미디어파이프의 카메라 제어 객체 참조
  const cameraRef = useRef<Camera | null>(null);
  // MediaStream 참조
  const streamRef = useRef<MediaStream | null>(null);

  // 상태 관리
  const [onAir, setOnAir] = useState(false); // 발표가 실행 중인지 여부
  const [loading, setLoading] = useState(true); // 모델 및 카메라가 로딩 중이면 로딩화면 표시용 

  // 초기화 로직 (컴포넌트가 처음 나타날 때 1회 실행)
  useEffect(() => {
    const initialize = async () => {
      try {
        setLoading(true); // 모델을 불러오는 동안 로딩 상태로 전환 

        // 모델 실행 엔진 불러오기
        const vision = await FilesetResolver.forVisionTasks(
          "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@0.10.3/wasm"
        );
        
        // 얼굴 인식 모델 불러오기
        // 얼굴 랜드마크 모델을 비동기로 로드
        const faceLandmarker = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: {
            modelAssetPath: `https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/1/face_landmarker.task`,
            delegate: "GPU",
          },
          runningMode: "VIDEO",
          outputFaceBlendshapes: true,
          numFaces: 1, // 최대 감지 얼굴 수 
        });
        faceLandmarkerRef.current = faceLandmarker;

        // 포즈 인식 모델 불러오기
        const poseLandmarker = await PoseLandmarker.createFromOptions(vision, {
            baseOptions: {
              modelAssetPath: `https://storage.googleapis.com/mediapipe-models/pose_landmarker/pose_landmarker_lite/float16/1/pose_landmarker_lite.task`,
              delegate: "GPU",
            },
            runningMode: "VIDEO",
            numPoses: 1,
          });
        poseLandmarkerRef.current = poseLandmarker;

        // 로딩 완료
        setLoading(false);
        // 카메라 시작
        await startCamera();
      } catch (e) {
        // 예외 처리
        console.error("Initialization failed:", e);
        alert("Failed to load models.");
      }
    };

    initialize();

    return () => {
      // 카메라 스트림 종료
      stopCamera();

      // 모델 리소스 해제 (컴포넌트가 사라질 때 GPU, 메모리 누수 방지용)
      faceLandmarkerRef.current?.close();
      poseLandmarkerRef.current?.close();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 카메라 시작 후 실시간 프레임 처리 함수
  const startCamera = async () => {
    // 발표 중이거나, video 요소가 존재하지 않으면 실행 중단 (중복 실행 방지 + 안정성 체크)
    const video = videoRef.current;
    if (onAir || !video) return;

    try {
      // 카메라 접근 권한 요청
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 1280, height: 720, facingMode: "user" }, 
        audio: false // 추후 audio 요청도 추가
      });

      // 비디오 요소에 스트림 연결 (video가 카메라 화면을 실시간으로 보여줄 준비 완료)
      video.srcObject = stream;

      // video의 메타 데이터(해상도, 길이 등)가 로드될 때까지 대기 
      await new Promise((resolve) => { video.onloadedmetadata = () => { resolve(video); }; });
      
      // 영상 재생 시작
      video.play();

      // 미디어파이프 카메라 객체 생성
      cameraRef.current = new Camera(video, { onFrame: async () => { await predictWebcam(); }, width: 1280, height: 720 });
      
      // 카메라 시작
      cameraRef.current.start();
      setOnAir(true);
    } catch (e) {
      // 예외 처리
      console.error(e);
      alert("카메라 권환을 확인해주세요.");
    }
  };

  // 카메라 정지 함수
  const stopCamera = () => {
    // 미디어파이프 카메라 정지
    cameraRef.current?.stop();
    // 참조 해제 (메모리 누수 방지)
    cameraRef.current = null;

    // 비디오 정지 및 스트림 종료 
    if (videoRef.current) {
      videoRef.current.pause();
      const stream = videoRef.current.srcObject as MediaStream;
      // 실제 카메라 장치 사용 종료 
      stream?.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }

    setOnAir(false);

    // 캔버스 초기화
    if (canvasRef.current) {
      const canvasCtx = canvasRef.current.getContext("2d");
      canvasCtx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
  };

  // 마지막으로 처리한 비디오 프레임 시간 저장 (같은 프레임이 중복 되는 것을 방지)
  let lastVideoTime = -1; 

  // 실시간으로 영상 프레임을 가져와 인식하고, 캔버스에 시각화하는 함수 
  const predictWebcam = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const faceLandmarker = faceLandmarkerRef.current;
    const poseLandmarker = poseLandmarkerRef.current;

    // 프레임 중복 방지 (이전 프레임과 같은 영상이면 처리하지 않음)
    if (!video || !canvas || !faceLandmarker || !poseLandmarker || video.currentTime === lastVideoTime) {
      return;
    }
    // 비디오가 아직 초기화되지 않았으면 종료
    if (video.videoWidth === 0) return;

    // 캔버스 크기 설졍
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    // videoTime 갱신
    lastVideoTime = video.currentTime;

    // 프레임 처리 시작 시간
    const startTimeMs = performance.now();

    // 얼굴 및 몸짓 예측
    const resultsFace = faceLandmarker.detectForVideo(video, startTimeMs);
    const resultsPose = poseLandmarker.detectForVideo(video, startTimeMs);

    // 캔버스 준비
    const canvasCtx = canvas.getContext("2d");
    if (canvasCtx) {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height);
      canvasCtx.save();
      canvasCtx.scale(-1, 1);
      canvasCtx.translate(-canvas.width, 0);

      // 상반신 그리기
      if (resultsPose.landmarks && resultsPose.landmarks.length > 0) {
        const poseLandmarks = resultsPose.landmarks[0];

        // ********* 여기서 지금 오류 발생: 몸에 나타나는 빨간 점들을 노란 선으로 연결해줘야하는데, 그게 안됨
        drawConnectors(canvasCtx, poseLandmarks, POSE_CONNECTIONS, { color: '#FFFF00', lineWidth: 5 });

        // 얼굴 부분(인덱스 0~10)을 제외한 몸만 빨간색 점으로 표시 
        const bodyLandmarks = poseLandmarks.filter((_, index) => index > 10);
        drawLandmarks(canvasCtx, bodyLandmarks, { color: '#FF0000', radius: 4 });
      }

      // 얼굴 그리기 
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
          {loading ? "모델 로딩 중..." : onAir ? "현재 녹화 및 녹음이 진행 되고 있습니다" : "카메라가 꺼져 있습니다"}
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