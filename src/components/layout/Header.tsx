import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";

const Bar = styled.header`
  height: 72px; display:flex; align-items:center; justify-content:space-between;
  padding: 0 28px; border-bottom:1px solid ${p=>p.theme.colors.border};
  background:#fff; position:sticky; top:0; z-index:10;
`;
const Left = styled.div`display:flex; align-items:center; gap:18px;`;
const Logo = styled(Link)`display:flex; align-items:center; gap:10px; font-weight:700;`;
const Dot = styled.span`width:18px; height:18px; border-radius:50%; background:${p=>p.theme.colors.primary}; display:inline-block;`;
const Nav = styled.nav`display:flex; gap:22px;`;
const NavBtn = styled.button`
  background:transparent; border:none; padding:8px 4px; color:${p=>p.theme.colors.text};
`;

export default function Header(){
  const nav = useNavigate();
  return (
    <Bar>
      <Left>
        <Logo to="/"><Dot/>{`발표의 숲`}</Logo>
        <Nav>
          <NavBtn onClick={()=>{ /* 동작 없음 */ }}>소개</NavBtn>
          <NavBtn onClick={()=>{ /* 동작 없음 */ }}>기능 소개</NavBtn>
          <NavBtn onClick={()=>{ /* 동작 없음 */ }}>사용 방법</NavBtn>
          <NavBtn onClick={()=>{ /* 동작 없음 */ }}>팀/문의</NavBtn>
        </Nav>
      </Left>
      <button onClick={()=> nav("/login")} style={{padding:"10px 16px", borderRadius:12, border:"1px solid #ddd", background:"#fff"}}>
        로그인
      </button>
    </Bar>
  );
}
