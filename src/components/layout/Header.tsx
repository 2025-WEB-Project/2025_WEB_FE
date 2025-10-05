// src/components/layout/Header.tsx
import styled from "styled-components";
import { Link, NavLink, useNavigate } from "react-router-dom";

type HeaderProps = { hideLogin?: boolean };

const Bar = styled.header`
  height: 72px; display:flex; align-items:center; justify-content:space-between;
  padding: 0 28px; border-bottom:1px solid ${p=>p.theme.colors.border};
  background:#fff; position:sticky; top:0; z-index:10;
`;

const Left = styled.div`display:flex; align-items:center; gap:18px;`;

const Logo = styled(Link)`
  display:flex; align-items:center; gap:10px; font-weight:800; color:inherit; text-decoration:none;
`;
const Dot = styled.span`
  width: 18px; height: 18px; border-radius:50%; background:${p=>p.theme.colors.primary}; display:inline-block;
`;

const Nav = styled.nav`display:flex; gap:22px;`;
const NavItem = styled(NavLink)`
  padding:8px 4px; border-bottom:2px solid transparent; color:${p=>p.theme.colors.text}; text-decoration:none;
  &.active { border-color:${p=>p.theme.colors.primary}; font-weight:700; }
`;

export default function Header({ hideLogin }: HeaderProps){
  const nav = useNavigate();
  return (
    <Bar>
      <Left>
        <Logo to="/">
          <Dot />
          발표의 숲
        </Logo>
        <Nav>
          <NavItem to="/about">소개</NavItem>
          <NavItem to="/features">기능 소개</NavItem>
          <NavItem to="/guide">사용 방법</NavItem>
          <NavItem to="/team">팀/문의</NavItem>
        </Nav>
      </Left>

      {!hideLogin && (
        <button
          onClick={()=> nav("/login")}
          style={{padding:"10px 16px", borderRadius:12, border:"1px solid #ddd", background:"#fff"}}
        >
          로그인
        </button>
      )}
    </Bar>
  );
}
