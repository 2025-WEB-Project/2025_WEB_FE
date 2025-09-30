import Header from "../components/layout/Header";
import styled from "styled-components";

const Hero = styled.section`
  max-width: 1100px; margin: 60px auto; padding: 0 20px;
  display:grid; grid-template-columns: 1.1fr .9fr; gap: 28px; align-items:center;
`;
const Big = styled.h1`
  font-size: 48px; line-height:1.15; margin:0 0 18px; font-weight:800;
`;

export default function Main(){
  return (
    <>
      <Header />
      <Hero>
        <div>
          <Big>AI 기반<br/>실시간 발표 피드백 서비스</Big>
        </div>
        <div style={{border:"1px dashed #c9d1d9", borderRadius:16, height:320,
                     display:"grid", placeItems:"center"}}>
          (그래프/모바일 목업 이미지 자리)
        </div>
      </Hero>
    </>
  );
}
