import { Outlet } from "react-router-dom";
import styled from "styled-components";
import Sidebar from "./Sidebar";

const Frame = styled.div`display:flex; height:100vh;`;
const Main = styled.main`flex:1; background:#fff; display:flex; flex-direction:column;`;
const Body = styled.div`flex:1; padding:24px; overflow:auto;`;

export default function AppLayout(){
  return (
    <Frame>
      <Sidebar />
      <Main>
        <Body>
          <Outlet />
        </Body>
      </Main>
    </Frame>
  );
}
