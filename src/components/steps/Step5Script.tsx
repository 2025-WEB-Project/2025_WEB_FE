import styled from "styled-components";
import StepHeader from "../layout/StepHeader";

// StyledComponent 정의
const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  height: 100vh;
  background-color: #fafafa;
  font-family: "Pretendard", sans-serif;
`;

const TitleWrapper = styled.div`
  width: 1200px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 60px;
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


const SkipBtn = styled.button`
  width: 200px;
  height: 70px;
  background-color: #fff;
  border: 1px solid #aaaaaa;
  border-radius: 15px;
  font-size: 24px;
  color: #a9a9a9;
  font-weight: 400;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 40px;

  &:hover {
    background-color: #c4c4c4;
    color: #fff;
    font-weight: bold;
  }
`;

const ScriptWrapper = styled.div`
  position: relative;
  width: 1125px;
  height: 500px;
  background-color: #fff;
  border-radius: 20px;
  box-shadow: 0 5px 15px rgba(145, 145, 145, 0.25);
  border: 1px solid #a9a9a9;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding: 40px 20px 40px 50px;
  font-size: 30px;
  font-weight: 300;
  color: #cfcfcf;
  line-height: 1.5;
`;

const EnterBtn = styled.button`
  position: absolute;
  bottom: 35px;
  right: 40px;
  width: 200px;
  height: 70px;
  background-color: #bfbfbf;
  border: none;
  border-radius: 15px;
  font-size: 24px;
  font-weight: 500;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #c4c4c4;
  }
`;



export default function Step5Script({ onNext, onPrev, onStep }: { onNext: () => void; onPrev: () => void; onStep: number; }) {
    return (
        <Container>
            <StepHeader onPrev={onPrev} onStep={onStep} />

            <TitleWrapper>
                <Title>스크립트를 입력해주세요.</Title>
                <SkipBtn onClick={onNext}>건너뛰기</SkipBtn>
            </TitleWrapper>

            <ScriptWrapper>
                Lorem ipsum dolor sit amet consectetur, adipisicing elit. At sapiente non nobis! Eligendi obcaecati, quos corrupti totam nesciunt autem. Voluptas!
                <EnterBtn onClick={onNext}>입력 완료</EnterBtn>
            </ScriptWrapper>
        </Container>
    );
};