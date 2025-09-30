import styled from "styled-components";
type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "solid"|"ghost" };
export const Button = styled.button<Props>`
  padding: 12px 18px;
  border-radius: ${p=>p.theme.radius};
  border: 1px solid ${p=>p.theme.colors.border};
  background: ${({variant,theme})=> variant==="ghost" ? "transparent" : theme.colors.black };
  color: ${({variant,theme})=> variant==="ghost" ? theme.colors.black : "#fff"};
  box-shadow: ${({variant})=> variant==="ghost" ? "none" : "0 6px 16px rgba(0,0,0,.12)"};
  &:disabled{ opacity:.5; cursor:not-allowed; }
`;
export default Button;
