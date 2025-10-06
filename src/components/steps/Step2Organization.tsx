import type React from "react";
import styled from "styled-components";
import StepHeader from "../layout/StepHeader";

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

const Title = styled.h1`
  width: 1200px;
  font-size: 40px;
  font-weight: bold;
  text-align: left;
  color: #111;
  line-height: 1.3;
  margin-bottom: 100px;
  font-family: 'Cafe24-Ssurround', 'Pretendard';
`;

const ButtonWrapper = styled.div`
  display: flex;
  gap: 80px;
  flex-wrap: wrap;
  justify-content: center;
`;

const Card = styled.div`
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

const Text = styled.p`
text-align: center;
  font-size: 40px;
  color: #a9a9a9;
  font-weight: 500;
  line-height: 1.5; 
`;

const Desc = styled.p`
  font-size: 20px;
  color: #a9a9a9;
  text-align: center;
  line-height: 1.8;
`

export default function Step2Organization({ onNext, onSelectType, onPrev, onStep }: { onNext: () => void; onSelectType: (type: string) => void; onPrev: () => void; onStep: number; }) {
    
    // 왼쪽 버튼(중학생/고등학생) 클릭 시 실행될 함수
    const handleSubjectClick = () => {
        onSelectType('subject'); // 부모의 presentationType을 'subject'로 설정
        onNext();                // 부모의 currentStep을 3으로 변경
    };

    // 오른쪽 버튼(대학생/취준생) 클릭 시 실행될 함수
    const handleTopicClick = () => {
        onSelectType('topic');   // 부모의 presentationType을 'topic'으로 설정
        onNext();                // 부모의 currentStep을 3으로 변경
    };

    return (
        <Container>
            <StepHeader onPrev={onPrev} onStep={onStep} />

            <Title>
                현재 소속을 선택해주세요.
            </Title>

            <ButtonWrapper>
                <Card onClick={handleSubjectClick}>
                    <Text>
                        중학생 <br />
                        고등학생
                    </Text>
                    <Desc>
                      과목에 따라 맞춤형 피드백이 제공됩니다!
                    </Desc>
                </Card>

                <Card onClick={handleTopicClick}>
                    <Text>
                        대학생 <br />
                        취업 준비생
                    </Text>
                    <Desc>
                      발표 주제에 따라 맞춤형 피드백이 제공됩니다!
                    </Desc>
                </Card>
            </ButtonWrapper>
        </Container>
    );
};