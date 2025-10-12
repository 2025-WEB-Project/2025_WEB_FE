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
  justify-content: center;
  align-items: flex-start;
`;

const CardWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 25px;
  width: 300px;
`;

const Card = styled.button`
  width: 280px;
  height: 120px;
  background-color: #fff;
  border: none;
  border-radius: 15px;
  box-shadow: 0 0px 20px rgba(145, 145, 145, 0.25);
  font-size: 48px;
  color: #cfcfcf;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Cafe24-Ssurround', 'Pretendard';

  &:hover {
    box-shadow: 0 8px 20px rgba(145, 145, 145, 0.35);
    transform: translateY(-5px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const Desc = styled.p`
  font-family: 'Pretendard';
  font-size: 20px;
  font-weight: 400;
  color: #a9a9a9;
  text-align: center;
  line-height: 1.5;
  margin-top: 50px;
`;


export default function Step4Feedback({ onNext, onPrev, onStep }: { onNext: () => void; onPrev: () => void; onStep: number; }) {
    return (
        <Container>
            <StepHeader onPrev={onPrev} onStep={onStep} />

            <Title>
                피드백 유형을 선택해주세요.
            </Title>

               

            <ButtonWrapper>
                <CardWrapper>
                    <Card onClick={onNext}>순한맛</Card>
                    <Desc>피드백 강도 설명 피드백 강도 설명 피드백 강도 설명</Desc>
                </CardWrapper>

                <CardWrapper>
                    <Card onClick={onNext}>보통맛</Card>
                    <Desc>피드백 강도 설명 피드백 강도 설명 피드백 강도 설명</Desc>
                </CardWrapper>

                <CardWrapper>
                    <Card onClick={onNext}>매운맛</Card>
                    <Desc>피드백 강도 설명 피드백 강도 설명 피드백 강도 설명</Desc>
                </CardWrapper>
            </ButtonWrapper>
        </Container>
    );
};