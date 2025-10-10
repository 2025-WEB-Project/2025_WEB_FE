// src/components/layout/Sidebar.tsx
import styled from "styled-components";
import { useMemo, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import logoutIcon from "../../assets/logout.png";
import trashIcon from "../../assets/trash.png";

const Wrap = styled.aside`
  position: relative;
  width: 280px;
  border-right: 1px solid ${(p) => p.theme.colors.border};
  background: #fff;
  height: 100%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const Brand = styled.h3`
  margin: 0 0 6px;
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 800;
`;

const Card = styled.div`
  background: ${(p) => p.theme.colors.panel};
  padding: 18px;
  border-radius: ${(p) => p.theme.radius};
`;

const Grid = styled.div`
  background: ${(p) => p.theme.colors.panel};
  padding: 14px;
  border-radius: ${(p) => p.theme.radius};
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 6px;
  font-size: 14px;
`;

const DayCell = styled.button<{
  $isToday?: boolean;
  $isEmpty?: boolean;
  $selected?: boolean;
}>`
  padding: 8px 0;
  border-radius: 8px;
  border: 1px solid
    ${({ theme, $isEmpty, $selected }) =>
      $selected ? theme.colors.black : $isEmpty ? "transparent" : theme.colors.border};
  background: ${({ $selected }) => ($selected ? "#111" : "#fff")};
  color: ${({ $selected }) => ($selected ? "#fff" : "inherit")};
  opacity: ${({ $isEmpty }) => ($isEmpty ? 0 : 1)};
  position: relative;
  &:after {
    content: ${({ $isToday }) => ($isToday ? "''" : "none")};
    position: absolute;
    right: 6px;
    top: 6px;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.primary};
  }
`;

const Small = styled.div`
  color: #888;
  font-size: 13px;
`;

const Bottom = styled.div`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid ${(p) => p.theme.colors.border};
  display: grid;
  gap: 6px;
`;

const LineBtn = styled.button`
  width: auto;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 4px;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: #666;
  font-size: 13px;
  cursor: pointer;
`;

const IconImg = styled.img`
  width: 16px;
  height: 16px;
  object-fit: contain;
`;

/* ── 탈퇴 확인 말풍선 UI ───────────────────────────────────────────── */
const ConfirmWrap = styled.div`
  position: relative;
  display: inline-block;
`;

const ConfirmBubble = styled.div`
  position: absolute;
  left: 0;
  bottom: calc(100% + 10px);
  transform: none;
  z-index: 100;

  background: #fff;
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 10px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: 12px;
  color: #333;
  font-size: 13px;
  min-width: 240px;
  max-width: 260px;

  &:after {
    content: "";
    position: absolute;
    left: 28px;
    bottom: -6px;
    width: 12px;
    height: 12px;
    background: #fff;
    border-left: 1px solid ${(p) => p.theme.colors.border};
    border-bottom: 1px solid ${(p) => p.theme.colors.border};
    transform: rotate(45deg);
  }
`;

const ConfirmActions = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;

  button {
    width: 100%;
    padding: 8px 0;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
  }
`;

const NoBtn = styled.button`
  border: 1px solid ${(p) => p.theme.colors.border};
  background: #fff;
`;

const YesBtn = styled.button`
  border: 1px solid ${(p) => p.theme.colors.border};
  background: #f2f4f6;
`;

/* ── 유틸 ─────────────────────────────────────────────────────────── */
function buildMonth(date = new Date()) {
  const y = date.getFullYear();
  const m = date.getMonth();
  const first = new Date(y, m, 1);
  const last = new Date(y, m + 1, 0);
  const startPad = first.getDay();
  const total = last.getDate();

  const cells: { day?: number; isEmpty?: boolean; isToday?: boolean }[] = [];
  for (let i = 0; i < startPad; i++) cells.push({ isEmpty: true });
  for (let d = 1; d <= total; d++) {
    const isToday =
      new Date().getFullYear() === y &&
      new Date().getMonth() === m &&
      new Date().getDate() === d;
    cells.push({ day: d, isEmpty: false, isToday });
  }
  return { y, m, cells };
}

/* ── 컴포넌트 ─────────────────────────────────────────────────────── */
export default function Sidebar() {
  const [selected, setSelected] = useState<number | null>(null);
  const [message, setMessage] = useState<string>("");
  const [showConfirm, setShowConfirm] = useState(false);

  const now = useMemo(() => new Date(), []);
  const { y, m, cells } = useMemo(() => buildMonth(now), [now]);

  const nav = useNavigate();
  const location = useLocation();
  const onRecordsPage = location.pathname.startsWith("/app/records");

  return (
    <Wrap>
      <Brand>발표의 숲</Brand>

      <Card>
        <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>000님</div>
        <div style={{ color: "#666" }}>sample@example.com</div>
      </Card>

      <button
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 12,
          border: "none",
          background: "#cfe0d7",
        }}
        onClick={() => nav("/present")}
      >
        발표 하러 가기
      </button>

      <button
        style={{
          width: "100%",
          padding: "12px",
          borderRadius: 12,
          border: "none",
          background: "#cfe0d7",
        }}
        onClick={() => (onRecordsPage ? nav("/app") : nav("/app/records"))}
      >
        {onRecordsPage ? "홈으로 이동" : "전체 기록 확인"}
      </button>

      <div style={{ fontSize: 14, marginTop: 6, marginBottom: 4 }}>
        {new Intl.DateTimeFormat("ko", { month: "long", year: "numeric" }).format(
          new Date(y, m, 1)
        )}
      </div>

      <Grid>
        {["S", "M", "T", "W", "T", "F", "S"].map((d) => (
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
        {/* 로그아웃 → 메인으로 */}
        <LineBtn onClick={() => nav("/")}>
          <IconImg src={logoutIcon} alt="로그아웃" />
          로그아웃
        </LineBtn>

        {/* 탈퇴 → 버튼 위 말풍선 */}
        <ConfirmWrap>
          <LineBtn
            onClick={() => setShowConfirm((v) => !v)}
            aria-expanded={showConfirm}
            aria-controls="leave-confirm"
          >
            <IconImg src={trashIcon} alt="탈퇴하기" />
            탈퇴하기
          </LineBtn>

          {showConfirm && (
            <ConfirmBubble id="leave-confirm" role="dialog" aria-label="탈퇴 확인">
              <div>정말 탈퇴하시겠습니까?</div>
              <ConfirmActions>
                <NoBtn type="button" onClick={() => setShowConfirm(false)}>
                  아니요
                </NoBtn>
                <YesBtn
                  type="button"
                  onClick={() => {
                    setShowConfirm(false);
                    nav("/"); // TODO: 실제 탈퇴 API 연동 시 처리
                  }}
                >
                  네
                </YesBtn>
              </ConfirmActions>
            </ConfirmBubble>
          )}
        </ConfirmWrap>
      </Bottom>
    </Wrap>
  );
}
