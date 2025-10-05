// src/pages/Signup.tsx
import styled from "styled-components";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

const Wrap = styled.div`
  max-width: 680px;
  margin: 100px auto;
  padding: 0 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Title = styled.h1`
  font-size: 44px;
  line-height: 1.2;
  margin: 0 0 40px;
  max-width: 520px;
  text-align: center;
`;

const Form = styled.div`
  width: 100%;
  max-width: 520px;
  margin: 0 auto;
`;

const Field = styled.div`
  display: grid;
  gap: 10px;
  margin: 18px 0;
`;

const Label = styled.label`
  font-size: 14px;
  color: ${(p) => p.theme.colors.text};
`;

const ErrorText = styled.div`
  color: ${(p) => p.theme.colors.danger};
  font-size: 13px;
  min-height: 18px;
`;


const EmailRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

const EmailInput = styled(Input)`
  flex: 1;               
`;

const DupButton = styled.button`
  padding: 10px 12px;
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radius};  
  background: #fff;
  white-space: nowrap;
  font-size: 14px;
  cursor: pointer;
`;

export default function Signup() {
  const nav = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [pw2, setPw2] = useState("");

  const [touched, setTouched] = useState({
    name: false,
    email: false,
    pw: false,
    pw2: false,
  });

  const [dupMsg, setDupMsg] = useState<string>("");

  const nameOk = useMemo(() => name.trim().length >= 2, [name]);
  const emailOk = useMemo(() => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  const pwOk = useMemo(
    () => /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pw),
    [pw]
  );
  const pw2Ok = useMemo(() => pwOk && pw2 === pw, [pwOk, pw2, pw]);

  const canSubmit = nameOk && emailOk && pwOk && pw2Ok;

  const submit = () => {
    if (!canSubmit) return;
    alert("회원가입이 완료되었습니다. 로그인 해주세요.");
    nav("/login");
  };

  const checkDuplicate = () => {
    setTouched((s) => ({ ...s, email: true }));
    if (!emailOk) {
      setDupMsg("올바른 이메일을 먼저 입력하세요.");
      return;
    }
    // TODO: 서버 연동 시 실제 중복 체크 API 호출
    setDupMsg("중복 확인은 서버 연동 후 제공됩니다.");
  };

  const emailError = touched.email && email.length > 0 && !emailOk;

  return (
    <Wrap>
      <Title>회원가입</Title>

      <Form>
        <Field>
          <Label>이름</Label>
          <Input
            placeholder="이름을 입력하세요"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => setTouched((s) => ({ ...s, name: true }))}
            $error={touched.name && name.length > 0 && !nameOk}
          />
          <ErrorText>
            {touched.name && name.length > 0 && !nameOk
              ? "이름은 2자 이상 입력해주세요."
              : ""}
          </ErrorText>
        </Field>

        <Field>
          <Label>이메일(아이디)</Label>
          <EmailRow>
            <EmailInput
              placeholder="sample@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setDupMsg("");
              }}
              onBlur={() => setTouched((s) => ({ ...s, email: true }))}
              $error={emailError}
            />
            <DupButton type="button" onClick={checkDuplicate}>
              중복확인
            </DupButton>
          </EmailRow>
          <ErrorText>
            {emailError ? "올바른 이메일 형식을 입력해주세요." : dupMsg}
          </ErrorText>
        </Field>

        <Field>
          <Label>비밀번호</Label>
          <Input
            type="password"
            placeholder="영문, 숫자, 특수 문자 포함 8자 이상"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onBlur={() => setTouched((s) => ({ ...s, pw: true }))}
            $error={touched.pw && pw.length > 0 && !pwOk}
          />
          <ErrorText>
            {touched.pw && pw.length > 0 && !pwOk
              ? "영문/숫자/특수문자 포함 8자 이상으로 입력해주세요."
              : ""}
          </ErrorText>
        </Field>

        <Field>
          <Label>비밀번호 확인</Label>
          <Input
            type="password"
            placeholder="비밀번호를 다시 입력"
            value={pw2}
            onChange={(e) => setPw2(e.target.value)}
            onBlur={() => setTouched((s) => ({ ...s, pw2: true }))}
            $error={touched.pw2 && pw2.length > 0 && !pw2Ok}
          />
          <ErrorText>
            {touched.pw2 && pw2.length > 0 && !pw2Ok
              ? "비밀번호가 일치하지 않습니다."
              : ""}
          </ErrorText>
        </Field>

        <Button style={{ width: "100%" }} disabled={!canSubmit} onClick={submit}>
          회원가입
        </Button>
      </Form>
    </Wrap>
  );
}
