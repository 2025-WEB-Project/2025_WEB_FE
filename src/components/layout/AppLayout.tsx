// src/components/layout/AppLayout.tsx
import { Outlet } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "./Sidebar";

const Frame = styled.div`
  display: flex;
  height: 100vh;      
`;

const Main = styled.main`
  flex: 1;
  background: #f7f8f9;  
  overflow: auto;
`;

const Inner = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: 28px;        
`;

export default function AppLayout() {
  return (
    <Frame>
      <Sidebar />
      <Main>
        <Inner>
          <Outlet />
        </Inner>
      </Main>
    </Frame>
  );
}
