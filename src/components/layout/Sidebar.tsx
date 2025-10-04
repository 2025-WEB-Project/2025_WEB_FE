// src/components/layout/Sidebar.tsx
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import logoImg from "../../assets/로고.png"; 

const Wrap = styled.aside`
  width: 280px; border-right:1px solid ${p=>p.theme.colors.border};
  background:#fff; height:100%; padding: 20px;
  display:flex; flex-direction:column; gap:18px;
`;

const Brand = styled.h3`
  margin:0 0 6px;
  display:flex; align-items:center; gap:10px;
  font-weight: 800;
`;
const BrandLogo = styled.img`
  width: 60px; height: 60px; object-fit: contain; 
`;

const Card = styled.div`
  background:${p=>p.theme.colors.panel}; padding:18px; border-radius:${p=>p.theme.radius};
`;

const Grid = styled.div`
  background:${p=>p.theme.colors.panel}; padding:14px; border-radius:${p=>p.theme.radius};
  display:grid; grid-template-columns: repeat(7, 1fr); gap:6px; font-size:14px;
`;

const DayCell = styled.button<{ $isToday?: boolean; $isEmpty?: boolean; $selected?: boolean }>`
  padding: 8px 0;
  border-radius: 8px;
  border: 1px solid ${({theme,$isEmpty,$selected}) =>
    $selected ? theme.colors.black : $isEmpty ? "transparent" : theme.colors.border};
  background: ${({$selected}) => $selected ? "#111" : "#fff"};
  color: ${({$selected}) => $selected ? "#fff" : "inherit"};
  opacity: ${({$isEmpty}) => $isEmpty ? 0 : 1};
  position: relative;
  &:after{
    content: ${({$isToday}) => $isToday ? "''" : "none"};
    position:absolute; right:6px; top:6px; width:6px; height:6px; border-radius:50%;
    background:${({theme})=> theme.colors.primary};
  }
`;

const Small = styled.div` color:#888; font-size:13px; `;

const Bottom = styled.div`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid ${p=>p.theme.colors.border};
  display: grid;
  gap: 6px;                     // ← 8px → 6px
`;

const LineBtn = styled.button`
  width: auto;                  // ← 100% → auto
  display: flex; align-items: center; gap: 8px;
  padding: 6px 4px;             // ← 12px → 6px 4px (작게)
  background: transparent;      // ← #fff → transparent
  border: none;                 // ← 테두리 제거
  border-radius: 6px;
  color: #666;                  // 작은 텍스트 느낌
  font-size: 13px;              // 살짝 더 작게
  cursor: pointer;
`;

const LogoDot = styled.span`
  width: 14px; height: 14px; border-radius: 50%;
  background: ${p=>p.theme.colors.primary};
  display: inline-block;
`;

function buildMonth(date = new Date()){
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m+1, 0);
  const startPad = first.getDay();
  const total = last.getDate();

  const cells: { day?: number; isEmpty?: boolean; isToday?: boolean }[] = [];
  for(let i=0;i<startPad;i++) cells.push({ isEmpty:true });
  for(let d=1; d<=total; d++){
    const isToday = (
      new Date().getFullYear()===y &&
      new Date().getMonth()===m &&
      new Date().getDate()===d
    );
    cells.push({ day:d, isEmpty:false, isToday });
  }
  return { y, m, cells };
}

export default function Sidebar(){
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState<string>(""); 
  const now = useMemo(()=> new Date(), []);
  const { y, m, cells } = useMemo(()=> buildMonth(now), [now]);
  const nav = useNavigate();

  return (
    <Wrap>
      <Brand>
        <BrandLogo src={logoImg} alt="발표의 숲 로고" />
        발표의 숲
      </Brand>

      <Card>
        <div style={{fontSize:24, fontWeight:700, marginBottom:8}}>000님</div>
        <div style={{color:"#666"}}>000대학교</div>
        <div style={{color:"#666"}}>0학년</div>
        <button
          style={{marginTop:14, width:"100%", padding:"12px", borderRadius:12, border:"none", background:"#cfe0d7"}}
          onClick={()=> nav("/present")}
        >
          발표 하러 가기
        </button>
      </Card>

      <div style={{fontSize:14, marginTop:6, marginBottom:4}}>
        {new Intl.DateTimeFormat("ko", { month:"long", year:"numeric"}).format(new Date(y,m,1))}
      </div>

      <Grid>
        {["S","M","T","W","T","F","S"].map((d) => (
          <div key={d} style={{ textAlign: "center", color: "#999" }}>
            {d}
          </div>
        ))}

        {cells.map((c, i) => (
          <DayCell
            key={i}
            onClick={() => {
              if (!c.isEmpty && c.day) {
                setSelected(c.day);
                setMessage("아직 발표 피드백 시작 전 입니다.");
              }
            }}
            $isToday={!!c.isToday}
            $isEmpty={!!c.isEmpty}
            $selected={selected === c.day}
          >
            {c.day ?? ""}
          </DayCell>
        ))}
      </Grid>

      {message && <Small>{message}</Small>}

      <Bottom>
        <LineBtn onClick={()=> nav("/login")}>
          <LogoDot /> 로그아웃
        </LineBtn>
        <LineBtn onClick={()=> nav("/")}>
          <LogoDot /> 탈퇴하기
        </LineBtn>
      </Bottom>
    </Wrap>
  );
}
