import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  *,*::before,*::after{ box-sizing:border-box; }
  html,body,#root{ height:100%; }
  body{ margin:0; color:${p=>p.theme.colors.text}; background:${p=>p.theme.colors.bg};
        font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Pretendard, sans-serif; }
  a{ color:inherit; text-decoration:none; }
  button{ cursor:pointer; }
  input,button,textarea,select{ font:inherit; }
`;
