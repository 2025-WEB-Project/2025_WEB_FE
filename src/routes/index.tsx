import { createBrowserRouter } from "react-router-dom";
import Main from "../pages/Main";
import Login from "../pages/Login";
import Signup from "../pages/Signup";
import MyPage from "../pages/MyPage";
import AppLayout from "../components/layout/AppLayout";

import Present from "../pages/Present";
import PresentStart from "../pages/PresentStart";

import About from "../pages/About";       
import Features from "../pages/Features"; 
import Guide from "../pages/Guide";       
import Team from "../pages/Team";   
import Records from "../pages/Records";

export const router = createBrowserRouter([
  { path: "/", element: <Main /> },
  { path: "/about", element: <About /> },        
  { path: "/features", element: <Features /> },  
  { path: "/guide", element: <Guide /> },        
  { path: "/team", element: <Team /> },          

  { path: "/login", element: <Login /> },
  { path: "/signup", element: <Signup /> },

  { path: "/present", element: <Present /> },  
  { path: "/present_start", element: <PresentStart /> }, 

  {
    path: "/app",
    element: <AppLayout />,
    children: [
      { index: true, element: <MyPage /> },
      { path: "records", element: <Records /> },
    ]
  }
]);
