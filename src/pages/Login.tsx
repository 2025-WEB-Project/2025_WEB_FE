import styled from "styled-components";
import Input from "../components/common/Input";
import Button from "../components/common/Button";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";

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
  line-height:1.2; 
  margin:0 0 40px;
  max-width: 520px; 
  text-align: center; 
`;

const Form = styled.div`
  width: 100%;
  max-width: 520px;  
  margin: 0 auto;
`;

const Field = styled.div`
  display:grid; 
  gap:10px; 
  margin:18px 0;
`;

const Label = styled.label`
  font-size:14px; 
  color:${p=>p.theme.colors.text};
`;

const ErrorText = styled.div`
  color: ${p=>p.theme.colors.danger}; 
  font-size: 13px;
  min-height: 18px;  
`;

const RowSplit = styled.div`
  display:flex;
  justify-content:space-between;  
  align-items:center;
  margin-top: 10px;
  color:#888; 
  font-size:14px;
`;

export default function Login(){
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [touched, setTouched] = useState({ email:false, pw:false });

  const emailOk = useMemo(()=> /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email), [email]);
  // 영문/숫자/특수문자 포함 8자 이상
  const pwOk = useMemo(()=> /^(?=.*[A-Za-z])(?=.*\d)(?=.*[^\w\s]).{8,}$/.test(pw), [pw]);

  const showEmailErr = touched.email && email.length>0 && !emailOk;
  const showPwErr = touched.pw && pw.length>0 && !pwOk;

  const canSubmit = emailOk && pwOk;

  return (
    <Wrap>
      <Title>이메일과 비밀번호를<br/>입력해주세요.</Title>

      <Form>
        <Field>
          <Label>이메일</Label>
          <Input
            placeholder="sample@example.com"
            value={email}
            onChange={e=> setEmail(e.target.value)}
            onBlur={()=> setTouched(s=>({...s, email:true}))}
            $error={showEmailErr}
          />
          <ErrorText>
            {showEmailErr ? "올바른 이메일 형식을 입력해주세요." : ""}
          </ErrorText>
        </Field>

        <Field>
          <Label>비밀번호</Label>
          <Input
            type="password"
            placeholder="영문, 숫자, 특수 문자 포함 8자 이상"
            value={pw}
            onChange={e=> setPw(e.target.value)}
            onBlur={()=> setTouched(s=>({...s, pw:true}))}
            $error={showPwErr}
          />
          <ErrorText>
            {showPwErr ? "영문/숫자/특수문자 포함 8자 이상으로 입력해주세요." : ""}
          </ErrorText>
        </Field>

        <Button style={{width:"100%"}} disabled={!canSubmit} onClick={()=> nav("/app")}>
            로그인
        </Button>

        <RowSplit>
            <Link to="/signup">회원가입</Link>
            <span>계정 찾기&nbsp;|&nbsp;비밀번호 찾기</span>
        </RowSplit>
      </Form>
    </Wrap>
  );
}
