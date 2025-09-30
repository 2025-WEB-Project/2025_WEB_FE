// src/styles/styled.d.ts
import "styled-components";
import type { AppTheme } from "./theme";

declare module "styled-components" {
  // ThemeProvider가 주입하는 theme의 타입을 AppTheme으로 확장
  export interface DefaultTheme extends AppTheme {}
}
