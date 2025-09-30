import Header from "../components/layout/Header";
import styled from "styled-components";

const Hero = styled.section`
  max-width: 1000px; margin: 60px auto; padding: 0 20px;
  display:grid; grid-template-columns: 1fr; gap: 18px; text-align:center;
`;
const Title = styled.h1`font-size:44px; margin:0;`;
const Lead = styled.p`font-size:18px; color:${p=>p.theme.colors.subtext}; margin:8px 0 0;`;
const Card = styled.div`
  margin: 24px auto; max-width: 820px;
  background: linear-gradient(180deg, #f7f8f9, #fff);
  border:1px solid ${p=>p.theme.colors.border};
  border-radius:${p=>p.theme.radius}; padding:28px; box-shadow:${p=>p.theme.shadow};
  text-align:left; line-height:1.7;
`;

export default function About(){
  return (
    <>
      <Header hideLogin />
      <Hero>
        <Title>AI 기반 실시간 발표 피드백</Title>
        <Lead>발표의 숲은 발표자의 말하기·시선·표정·자세를 실시간으로 분석하고, 더 나은 발표를 돕는 서비스입니다.</Lead>
        <Card>
          <strong>한눈에 보는 핵심</strong>
          <ul>
            <li>웹캠·마이크만 있으면 어디서든 연습/실전 사용</li>
            <li>실시간 피드백과 발표 후 리포트 제공</li>
            <li>개인 기록 대시보드로 성장 추적</li>
          </ul>
        </Card>
      </Hero>
    </>
  );
}
