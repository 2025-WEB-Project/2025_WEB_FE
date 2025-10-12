import styled from "styled-components";
import StepHeader from "../layout/StepHeader";
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

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

const TimeWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 50px;
  margin-bottom: 120px;
`;

const TimeBox = styled.div`
  display: flex;
  align-items: center;
  gap: 25px;
`;


const TimeInput = styled.input<{ $active: boolean }>`
  width: 180px;
  height: 140px;
  border: 1px solid ${({ $active }) => ($active ? "#111" : "#a8a8a8")};
  border-radius: 10px;
  text-align: center;
  font-size: 64px;
  font-weight: 500;
  color: #111;
  background-color: #fff;
  transition: all 0.3s ease;

  &::placeholder {
    color: #cfcfcf;
  }

  &:focus {
    outline: none;
    box-shadow: 0 5px 20px rgba(145, 145, 145, 0.25);
  }
`;

const Unit = styled.span<{ $active: boolean }>`
  font-size: 48px;
  font-weight: 500;
  color: ${({ $active }) => ($active ? "#111" : "#b5b5b5")};
  transition: color 0.3s ease;
`;

const SubmitBtn = styled.button`
  width: 240px;
  height: 80px;
  background-color: #bfbfbf;
  border: none;
  border-radius: 20px;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    background-color: #c4c4c4;
  }
`;

export default function Step6Time({ onPrev, onStep }: { onPrev: () => void; onStep: number; }) {
  const navigate = useNavigate();

  const handleNext = () => {
    navigate("/Present"); 
  };


  const [hourFocused, setHourFocused] = useState(false);
  const [minuteFocused, setMinuteFocused] = useState(false);
  const [hourValue, setHourValue] = useState("");
  const [minuteValue, setMinuteValue] = useState("");

  const hourActive = hourFocused || hourValue !== "";
  const minuteActive = minuteFocused || minuteValue !== "";  

  return (
        <Container>
            <StepHeader onPrev={onPrev} onStep={onStep} />

            <Title>발표 제한 시간을 입력해주세요.</Title>

            <TimeWrapper>
              {/* 시간 */}
              <TimeBox>
                <TimeInput
                  placeholder="0"
                  value={hourValue}
                  onFocus={() => setHourFocused(true)}
                  onBlur={() => setHourFocused(false)}
                  onChange={(e) => setHourValue(e.target.value)}
                  $active={hourActive}
                />
                <Unit $active={hourActive}>시간</Unit>
              </TimeBox>

              {/* 분 */}
              <TimeBox>
                <TimeInput
                  placeholder="15"
                  value={minuteValue}
                  onFocus={() => setMinuteFocused(true)}
                  onBlur={() => setMinuteFocused(false)}
                  onChange={(e) => setMinuteValue(e.target.value)}
                  $active={minuteActive}
                />
                <Unit $active={minuteActive}>분</Unit>
              </TimeBox>
            </TimeWrapper>

            <SubmitBtn onClick={handleNext}>완료</SubmitBtn>
        </Container>
    );
};