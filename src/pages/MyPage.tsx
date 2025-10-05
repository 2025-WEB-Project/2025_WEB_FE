// src/pages/MyPage.tsx
import { useMemo } from "react";
import styled from "styled-components";

type Rec = {
  id: string;
  ts: string;
  durationSec: number;
};

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
`;

const Panel = styled.div`
  background: #fff;
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.radius};
  padding: 16px;
  box-shadow: ${(p) => p.theme.shadow};
`;

const ChartBox = styled(Panel)`
  height: 320px;
  display: grid;
  place-items: center;
  color: #7e56cf;
`;

const SectionTitle = styled.h3`
  font-size: 22px;
  font-weight: 800;
  margin: 0 0 10px;
`;

const Row = styled.button`
  width: 100%;
  padding: 14px 16px;
  display: grid;
  grid-template-columns: 40px 1fr auto 110px;
  gap: 10px;
  align-items: center;
  border: 0;
  background: transparent;
  border-top: 1px solid ${({ theme }) => theme.colors.border};
  &:first-child { border-top: 0; }
  &:hover { background: ${({ theme }) => theme.colors.panel}; }
`;

const Icon = styled.div`
  width: 32px; height: 32px; border-radius: 50%;
  background: #eef2f6; display: grid; place-items: center; font-size: 18px;
`;

const TitleText = styled.div`
  font-weight: 700;
  justify-self: start;
`;

const Sub = styled.div`
  color: #8b8f94; font-size: 14px;
  justify-self: end; text-align: right;
`;

const Duration = styled.div`
  font-weight: 700; color: #111; font-size: 14px;
  justify-self: end; text-align: right;
`;

function formatKDate(iso: string) {
  const d = new Date(iso);
  const days = ["일", "월", "화", "수", "목", "금", "토"];
  const y = d.getFullYear();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  const dow = days[d.getDay()] + "요일";
  let h = d.getHours();
  const ap = h < 12 ? "오전" : "오후";
  h = h % 12; if (h === 0) h = 12;
  const mm = d.getMinutes().toString().padStart(2, "0");
  return `${y}.${m}.${day} ${dow} ${ap} ${h}시 ${mm}분`;
}

function formatDur(sec: number) {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}분 ${s}초`;
}

export default function MyPage() {
  const records = useMemo<Rec[]>(
    () => [
      { id: "20251001_001", ts: "2025-09-30T16:37:00+09:00", durationSec: 1012 },
      { id: "20251001_002", ts: "2025-09-30T15:37:00+09:00", durationSec: 1012 },
      { id: "20250930_001", ts: "2025-09-30T16:37:00+09:00", durationSec: 1012 },
      { id: "20250930_002", ts: "2025-09-30T17:12:00+09:00", durationSec: 998 },
      { id: "20250929_001", ts: "2025-09-29T20:05:00+09:00", durationSec: 450 },
      { id: "20250929_002", ts: "2025-09-29T19:05:00+09:00", durationSec: 550 },
      { id: "20250928_003", ts: "2025-09-28T09:41:00+09:00", durationSec: 1320 },
    ],
    []
  );

  const top5 = useMemo(
    () => [...records].sort((a, b) => b.id.localeCompare(a.id)).slice(0, 5),
    [records]
  );

  return (
    <Grid>
      <SectionTitle>성장 차트</SectionTitle>
      <ChartBox>그래프</ChartBox>

      <SectionTitle>최근 기록</SectionTitle>
      <Panel>
        {top5.map((r) => (
          <Row key={r.id}>
            <Icon>📷</Icon>
            <TitleText>{r.id}</TitleText>
            <Sub>{formatKDate(r.ts)}</Sub>
            <Duration>{formatDur(r.durationSec)}</Duration>
          </Row>
        ))}
      </Panel>
    </Grid>
  );
}
