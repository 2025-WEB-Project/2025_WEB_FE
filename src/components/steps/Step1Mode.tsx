import React from "react";
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
  font-size: 40px;
  color: #a9a9a9;
  font-weight: 500;
`;

const Desc = styled.p`
  font-size: 20px;
  color: #a9a9a9;
  text-align: center;
  line-height: 1.8;
`

export default function Step1Mode({ onNext, onStep, onPrev }: { onNext: () => void; onStep: number; onPrev: () => void; }) {
    return (
        <Container>
            <StepHeader onPrev={onPrev} onStep={onStep} />

            <Title>
                모드를 선택해주세요.
            </Title>

            <ButtonWrapper>
                <Card onClick={onNext}>
                    <Text>실전 모드</Text>
                    <Desc>
                      실시간 피드백 및 스크립트가 화면에 보여지지 않습니다. <br />
                      실제 발표 상황과 동일하게 연습해보세요! <br />
                      발표 중급자에게 추천해요.
                    </Desc>
                </Card>

                <Card onClick={onNext}>
                    <Text>연습 모드</Text>
                    <Desc>
                      실시간 피드백 및 스크립트가 화면에 보여집니다. <br />
                      AI와 함께 실시간으로 연습해보세요! <br />
                      발표 입문자에게 추천해요.
                    </Desc>
                </Card>
            </ButtonWrapper>
        </Container>
    );
};