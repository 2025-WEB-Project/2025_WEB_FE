import Header from "../components/layout/Header";
import styled from "styled-components";

const Wrap = styled.section`max-width:1000px; margin:60px auto; padding:0 20px;`;
const Title = styled.h1`font-size:44px; margin:0 0 18px; text-align:center;`;
const Grid = styled.div`
  display:grid; grid-template-columns: repeat(4, minmax(0,1fr)); gap:16px;
  @media (max-width: 980px){ grid-template-columns: repeat(2, minmax(0,1fr)); }
  @media (max-width: 560px){ grid-template-columns: 1fr; }
`;
const Card = styled.div`
  background:#fff; border:1px solid ${p=>p.theme.colors.border};
  border-radius:${p=>p.theme.radius}; padding:18px; text-align:center; box-shadow:${p=>p.theme.shadow};
`;
const Name = styled.div`font-weight:700; font-size:18px;`;
const Role = styled.div`color:${p=>p.theme.colors.subtext}; margin-top:6px;`;

const Contact = styled.div`
  margin-top:24px; text-align:center; color:${p=>p.theme.colors.subtext};
`;

export default function Team(){
  return (
    <>
      <Header hideLogin />
      <Wrap>
        <Title>팀 & 문의</Title>
        <Grid>
          <Card><Name>김영우</Name><Role>Frontend</Role></Card>
          <Card><Name>최서영</Name><Role>Frontend</Role></Card>
          <Card><Name>정수필</Name><Role>Backend</Role></Card>
          <Card><Name>황인성</Name><Role>Backend</Role></Card>
        </Grid>
        <Contact>문의: 광운대학교 정보융합학부</Contact>
      </Wrap>
    </>
  );
}
