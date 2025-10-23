import React from "react";
import styled from "styled-components";

// 아이콘 import
import LeftArrowIcon from "../../assets/left-arrow.svg?react";

const Header = styled.div`
  width: 1400px;
  height: 200px;
  display: flex;
  justify-content: start;
  align-items: center;
  margin-bottom: 10px;
  margin-top: 50px;
  position: fixed;
  top: 0;
`;

const Number = styled.ul`
  list-style: none;
  display: flex;
  gap: 15px;
`;

const NumberItem = styled.li<{ active?: boolean }>`
  font-size: 24px;
  width: 50px;
  text-align: center;
  border-radius: 10px;
  padding: 5px;
  height: 50px;
  line-height: 1.6;
  border: 0.5px solid #b5b5b5;
  box-shadow: 0px 5px 10px rgba(0, 0, 0, 0.1);

  background-color: ${({ active }) => (active ? "#bfbfbf" : "#fff")};
  color: ${({ active }) => (active ? "#fff" : "#000")};
  font-weight: ${({ active }) => (active ? "bold" : "normal")};
`;

export default function StepHeader({ totalSteps = 6, onStep, onPrev }: { totalSteps?: number; onStep: number; onPrev: () => void; }) {
    return (
    <Header>
      {/* 뒤로가기 버튼 */}
      {onPrev && (
        <LeftArrowIcon
          onClick={onPrev}
          style={{ width: "50px", height: "50px", color: "#111", cursor: "pointer" }}
        />
      )}

      {/* 단계 표시 */}
      <Number>
        {Array.from({ length: totalSteps }, (_, i) => i + 1).map((num) => (
          <NumberItem key={num} active={onStep === num}>
            {num}
          </NumberItem>
        ))}
      </Number>
    </Header>
  );
}
