import { createBrowserRouter } from "react-router-dom";
import Main from "../pages/Main";
import Login from "../pages/Login";
import MyPage from "../pages/MyPage";
import AppLayout from "../components/layout/AppLayout";
import Present from "../pages/Present";   // ✅ 그대로 사용

export const router = createBrowserRouter([
  { path: "/", element: <Main /> },
  { path: "/login", element: <Login /> },

  // ✅ 발표 전용 단독 페이지 (사이드바 없음)
  { path: "/present", element: <Present /> },

  // 앱 내부(사이드바 있는 영역)
  {
    path: "/app",
    element: <AppLayout />,
    children: [
      { index: true, element: <MyPage /> },
      // ⛔ 여기 있던 { path: "present", ... }는 삭제하세요
    ]
  }
]);
