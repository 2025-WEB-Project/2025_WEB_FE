import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";

// 아이콘 import
import CameraIcon from "../assets/camera.svg?react";
import UploadIcon from "../assets/upload.svg?react";

// 각 Step별 컴포넌트 불러오기
import Step1Mode from "../components/steps/Step1Mode";
import Step2Organization from "../components/steps/Step2Organization";
import Step3_1Subject from "../components/steps/Step3-1Subject";
import Step3_2Topic from "../components/steps/Step3-2Topic";
import Step4Feedback from "../components/steps/Step4Feedback";
import Step5Script from "../components/steps/Step5Script";
import Step6Time from "../components/steps/Step6Time";

// StyledComponent 정의
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #fafafa;
  font-family: "Pretendard", sans-serif;
`;

export const Title = styled.h1`
  width: 1200px;
  font-size: 40px;
  font-weight: bold;
  text-align: left;
  color: #111;
  line-height: 1.3;
  margin-bottom: 80px;
  font-family: 'Cafe24-Ssurround', 'Pretendard';
`;

export const Name = styled.strong`
  font-size: 48px;
`

export const ButtonWrapper = styled.div`
  display: flex;
  gap: 80px;
  flex-wrap: wrap;
  justify-content: center;
`;

export const Card = styled.div`
  width: 575px;
  height: 400px;
  border-radius: 30px;
  background: white;
  box-shadow: 0px 5px 70px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0px 12px 30px rgba(0, 0, 0, 0.12);
  }
`;

export const Text = styled.p`
  font-size: 40px;
  color: #a9a9a9;
  font-weight: 500;
`;

export default function PresentStart() {
    const navigate = useNavigate(); 

    // 기본 브라우저 권한창을 띄우는 함수
    const handleCameraStart = async () => {
      try {
        // 브라우저 기본 권한 요청 창 자동 표시
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });

        // 권한 허용 시 실행 (예: 다음 페이지 이동)
        if (stream) {
          alert("카메라 및 마이크 권한이 허용되었습니다.");
          setCurrentStep(1);
        }
      } catch (error) {
        if (error instanceof Error) {
          if (error.name === "NotAllowedError") {
            alert("권한이 거부되었습니다. 브라우저 설정을 확인해주세요.");
          } else {
            alert("권한 요청 중 오류가 발생했습니다: " + error.message);
          }
        } else {
          alert("권한 요청 중 알 수 없는 오류가 발생했습니다.");
        }
      }
    };

    // 영상 업로드 클릭 시 Feedback.jsx로 이동  ***추후 수정
    const handleUpload = () => {
        // navigate("/feedback");
    };


    // Step 변경
    const [currentStep, setCurrentStep] = useState(0);
    
    // Step 2의 선택을 저장하는 State
    // 중/고등학생 -> subject
    // 대학생/취업준비생 -> topic
    const [presentationType, setPresentationType] = useState('');

    const handleNextStep = () => {
      setCurrentStep(prevStep => prevStep + 1);
    };

    const handlePrevStep = () => {
      setCurrentStep(prevStep => Math.max(prevStep - 1, 0));
    }

    const renderStep = () => {
      switch (currentStep) {
        case 1:
          return <Step1Mode 
            onNext={handleNextStep} 
            onStep={currentStep} 
            onPrev={handlePrevStep}
          />;
        
        case 2:
          return <Step2Organization
            onNext={handleNextStep}
            onSelectType={setPresentationType}
            onPrev={handlePrevStep}
            onStep={currentStep} 
          />;
        
        case 3:
          if (presentationType === 'subject') {
            return <Step3_1Subject 
              onNext={handleNextStep} 
              onPrev={handlePrevStep}
              onStep={currentStep} 
            />;
          } else {
            // topic
            return <Step3_2Topic 
              onNext={handleNextStep} 
              onPrev={handlePrevStep}
              onStep={currentStep} 
            />;
          }
        
        case 4:
          return <Step4Feedback 
            onNext={handleNextStep} 
            onPrev={handlePrevStep}  
            onStep={currentStep} 
          />;

        case 5:
          return <Step5Script 
            onNext={handleNextStep}
            onPrev={handlePrevStep} 
            onStep={currentStep} 
          />;
          
        case 6:
          return <Step6Time 
            onNext={handleNextStep} 
            onPrev={handlePrevStep}
            onStep={currentStep} 
          />;

        default:
          return (
            <>
              <Title>
                <Name>000</Name> 님
                <br />
                발표의 숲에 오신것을 환영합니다 ✨
              </Title>

              <ButtonWrapper>
                <Card onClick={handleCameraStart}>
                  <CameraIcon style={{width: "90px", height: "90px", color: "#a9a9a9"}} />
                  <Text>촬영 시작</Text>
                </Card>

                <Card onClick={() => navigate("/feedback")}>
                  <UploadIcon style={{width: "90px", height: "90px", color: "#a9a9a9"}} />
                  <Text>영상 업로드</Text>
                </Card>
              </ButtonWrapper>
            </>
          );
      }
    }

    return(
        <Container>
            {renderStep()}
        </Container>
    );
};

