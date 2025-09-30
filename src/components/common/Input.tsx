import styled from "styled-components";

/** DOM에 전달되지 않도록 transient prop($error) 사용 */
const Input = styled.input<{ $error?: boolean }>`
  width: 100%;
  padding: 12px 14px;
  border-radius: 10px;
  border: 1px solid ${({ $error, theme }) =>
    $error ? theme.colors.danger : theme.colors.border};
  background: #fff;
  outline: none;
  &:focus {
    box-shadow: 0 0 0 3px rgba(0,0,0,.05);
  }
`;
export default Input;
