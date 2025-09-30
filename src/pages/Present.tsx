// src/pages/Present.tsx
import { useEffect, useRef, useState } from "react";
import styled from "styled-components";
import { Camera } from "@mediapipe/camera_utils";

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

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: transparent;
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
`;

const StopIcon = styled.span`
  width: 18px;
  height: 18px;
  border-radius: 4px;
  background: #d43c3c; /* ■ 정지 아이콘 */
  display: inline-block;
`;

const StartIcon = styled.span`
  /* ▶ 시작 아이콘 (삼각형) */
  width: 0;
  height: 0;
  border-left: 18px solid #d43c3c;
  border-top: 10px solid transparent;
  border-bottom: 10px solid transparent;
  display: inline-block;
  margin-left: 2px;
`;

const Right = styled.div``; 

export default function Present() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const cameraRef = useRef<Camera | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [onAir, setOnAir] = useState(false);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      if (videoRef.current) {
        cameraRef.current = new Camera(videoRef.current, {
          onFrame: async () => {
            /* mediapipe 처리 연결 지점 (추후) */
          },
          width: 1280,
          height: 720,
        });
        await cameraRef.current.start();
      }

      setOnAir(true);
    } catch (e) {
      console.error(e);
      setOnAir(false);
      alert("카메라 권한을 확인해주세요.");
    }
  };

  const stopCamera = () => {
    try {
      cameraRef.current?.stop();
    } catch {}
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.srcObject = null;
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setOnAir(false);
  };

  useEffect(() => {
    startCamera();
    return () => stopCamera();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Page>
      <Stage>
        <Video ref={videoRef} playsInline muted />
      </Stage>

      <Footer>
        <Status>
          <Dot $onair={onAir} />
          {onAir ? "현재 녹화 및 녹음이 진행 되고 있습니다" : "카메라가 꺼져 있습니다."}
        </Status>

        <StopBtn
          onClick={() => (onAir ? stopCamera() : startCamera())}
          title={onAir ? "카메라 정지" : "카메라 시작"}
          aria-label={onAir ? "카메라 정지" : "카메라 시작"}
        >
          {onAir ? <StopIcon /> : <StartIcon />}
        </StopBtn>

        <Right />
      </Footer>
    </Page>
  );
}
