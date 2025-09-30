import Header from "../components/layout/Header";
import styled from "styled-components";

const Wrap = styled.section`max-width:900px; margin:60px auto; padding:0 20px;`;
const Title = styled.h1`font-size:44px; margin:0 0 18px; text-align:center;`;
const Steps = styled.ol`
  counter-reset: step; display:grid; gap:14px;
  li{
    list-style:none; background:#fff; border:1px solid ${p=>p.theme.colors.border};
    border-radius:${p=>p.theme.radius}; padding:16px 18px; box-shadow:${p=>p.theme.shadow};
  }
`;

export default function Guide(){
  return (
    <>
      <Header hideLogin />
      <Wrap>
        <Title>사용 방법</Title>
        <Steps>
          <li><strong>로그인</strong> 후 마이페이지에서 <em>발표 하러 가기</em>를 누릅니다.</li>
          <li>카메라·마이크 권한을 허용하고, 발표 모드/주제/시간을 설정합니다.</li>
          <li>실시간 패널의 지표를 참고하며 발표를 진행합니다.</li>
          <li>발표 종료 후 리포트에서 점수/로그/추천을 확인합니다.</li>
        </Steps>
      </Wrap>
    </>
  );
}
