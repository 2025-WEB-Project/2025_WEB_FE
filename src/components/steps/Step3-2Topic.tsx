import styled from "styled-components";
import type React from "react";
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

const Desc = styled.p`
    font-family: 'pretendard';
    font-size: 24px;
    font-weight: 400;
    color: #a9a9a9;
`;

const Input = styled.input`
    width: 825px;
    height: 110px;
    border-radius: 10px;
    border: 1px solid #a9a9a9;
    background-color: #fff;
    font-size: 30px;
    padding-left: 30px;
    font-weight: 300;
    box-shadow: 0 5px 15px rgba(145, 145, 145, 0.25);

    &::placeholder {
        color: #cfcfcf;
    }

    &:focus {
        outline: none;
    }
`;

const SubmitBtn = styled.button`
    width: 195px;
    height: 110px;
    color: #fff;
    background-color: #bfbfbf;
    font-weight: bold;
    border-radius: 15px;
    font-size: 32px;
    border: none;
`;

export default function Step3_2Topic({ onNext, onPrev, onStep }: { onNext: () => void; onPrev: () => void; onStep: number; }) {
    return (
        <Container>
            <StepHeader onPrev={onPrev} onStep={onStep} />

            <Title>
                발표 주제를 입력해주세요.

                <Desc>
                    주제가 자세할수록 더욱 정확한 피드백이 제공됩니다.
                </Desc> 
            </Title>

               

            <ButtonWrapper>
                <Input placeholder="ex) 웹서비스설계및실습 전공 과목 최종 프로젝트 발표"></Input>                
                <SubmitBtn onClick={onNext}>입력</SubmitBtn>
            </ButtonWrapper>
        </Container>
    );
};