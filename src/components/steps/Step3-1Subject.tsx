import styled from "styled-components";
import StepHeader from "../layout/StepHeader";
import type React from "react";

// StyledComponent 정의
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  background-color: #fafafa;
  font-family: "Pretendard", sans-serif;
  position: relative;
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
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 50px;
  justify-items: center;
  align-items: center;
`;

const SubBtn = styled.button`
    width: 200px;
    height: 80px;
    border-radius: 20px;
    border: 0.5px solid #b5b5b5;
    color: #8a8a8a;
    font-size: 32px;
    background-color: #fff;
    font-weight: 500;

    &:hover, &:focus {
        background-color: #bfbfbf;
        color: #fff;
        border: none;
    }
`;

const Submit = styled.button`
    width: 300px;
    height: 80px;
    background-color: #bfbfbf;
    border-radius: 15px;
    font-weight: 600;
    font-size: 36px;
    color: #fff;
    margin-top: 100px;
    border: none;
`

export default function Step3_1Subject({ onNext, onPrev, onStep }: { onNext: () => void; onPrev: () => void; onStep: number; }) {
    return (
        <Container>
            <StepHeader onPrev={onPrev} onStep={onStep} />

            <Title>
                과목을 선택해주세요.
            </Title>

            <ButtonWrapper>
                <SubBtn>국어</SubBtn>
                <SubBtn>수학</SubBtn>
                <SubBtn>영어</SubBtn>
                <SubBtn>사회/역사</SubBtn>
                <SubBtn>과학</SubBtn>
                <SubBtn>도덕</SubBtn>
                <SubBtn>정보</SubBtn>
                <SubBtn>체육</SubBtn>
                <SubBtn>음악</SubBtn>
                <SubBtn>미술</SubBtn>
                <SubBtn>제2외국어</SubBtn>
                <SubBtn>한문</SubBtn>
                <SubBtn>기술·가정</SubBtn>
            </ButtonWrapper>

            <Submit onClick={onNext}>
                확인
            </Submit>
        </Container>
    );
};