import Header from "../components/layout/Header";
import styled from "styled-components";
import logoImg from "../assets/로고.png";  
import mypageImg from "../assets/mypage.jpg";

const Page = styled.div`
  position: relative;
  min-height: 100vh;
  overflow: hidden;
  background: #fff;
`;

const Bg = styled.div`
  position: absolute;
  inset: 0;
  opacity: .5;                      
  background-position: center 50%;  
  background-repeat: no-repeat;
  background-size: clamp(500px, 100vw, 1000px);
  pointer-events: none;
  z-index: 0;
`;

const Hero = styled.section`
  position: relative; z-index: 1;     
  max-width: 1100px; margin: 60px auto; padding: 0 20px;
  display:grid; grid-template-columns: 1.1fr .9fr; gap: 28px; align-items:center;
`;

const Big = styled.h1`
  font-size: 48px; line-height:1.15; margin:0 0 18px; font-weight:800;
`;

const CornerShot = styled.img`
  position: absolute;
  right: 0;
  bottom: 0;
  width: clamp(220px, 80vw, 900px);
  height: auto;
  border-radius: 16px 0 0 0 ;
  border: 1px solid ${(p) => p.theme.colors.border};
  box-shadow: 0 18px 48px rgba(0,0,0,.22), 0 8px 20px rgba(0,0,0,.12); /* 입체감 */
  z-index: 2;           
  pointer-events: none; 
`;

export default function Main(){
  return (
    <Page>
      <Header logoSrc={logoImg} />

      <Bg style={{ backgroundImage: `url(${logoImg})` }} />

      <Hero>
        <div>
          <Big>AI 기반<br/>실시간 발표 피드백 서비스</Big>
        </div>
        
      </Hero>
      <CornerShot src={mypageImg} alt="마이페이지 미리보기" />
    </Page>
  );
}
