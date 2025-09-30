import Header from "../components/layout/Header";
import styled from "styled-components";

const Wrap = styled.section`max-width:1000px; margin:60px auto; padding:0 20px;`;
const Title = styled.h1`font-size:44px; margin:0 0 18px; text-align:center;`;
const Grid = styled.div`
  display:grid; grid-template-columns: repeat(2, minmax(0,1fr)); gap:18px;
  @media (max-width: 840px){ grid-template-columns: 1fr; }
`;
const Card = styled.div`
  background:#fff; border:1px solid ${p=>p.theme.colors.border};
  border-radius:${p=>p.theme.radius}; padding:22px; box-shadow:${p=>p.theme.shadow};
`;
const H = styled.h3`margin:0 0 8px;`;

export default function Features(){
  return (
    <>
      <Header hideLogin />
      <Wrap>
        <Title>핵심 기능</Title>
        <Grid>
          <Card><H>실시간 피드백</H><p>발화 속도, 음량 안정성, 중복어/간투어 등을 즉시 표시합니다.</p></Card>
          <Card><H>시선·표정·자세</H><p>카메라 기반으로 시선 분포/표정 변화/상체 자세를 종합 분석합니다.</p></Card>
          <Card><H>스크립트/타이머</H><p>발표 원고 표시와 목표 시간 관리로 안정적인 발표를 돕습니다.</p></Card>
          <Card><H>리포트/기록</H><p>발표 종료 후 요약 리포트와 점수, 세부 로그를 저장해 성장 과정을 추적합니다.</p></Card>
        </Grid>
      </Wrap>
    </>
  );
}
