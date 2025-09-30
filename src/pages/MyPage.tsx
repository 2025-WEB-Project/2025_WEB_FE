// src/pages/MyPage.tsx
import styled from "styled-components";

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 18px;
`;

const Search = styled.input`
  width: 100%;
  padding: 12px 14px;
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 12px;
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

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  th,
  td {
    border-bottom: 1px solid ${(p) => p.theme.colors.border};
    padding: 10px;
    text-align: left;
  }
  th {
    color: #666;
    font-weight: 600;
  }
`;

export default function MyPage() {
  return (
    <Grid>
      <Search placeholder="Search" />

      <ChartBox>그래프</ChartBox>

      <Panel>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            marginBottom: 10,
          }}
        >
          <button
            style={{
              border: "1px solid #111",
              background: "#fff",
              padding: "6px 10px",
              borderRadius: 20,
            }}
          >
            최근기록
          </button>
        </div>

        <Table>
          <thead>
            <tr>
              <th>날짜</th>
              <th>말하기</th>
              <th>시선/표정</th>
              <th>자세</th>
              <th>발표 내용</th>
              <th>최종 점수</th>
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: 8 }, (_, i) => (
              <tr key={i}>
                <td>2025.9.{22 + i}</td>
                <td>90</td>
                <td>56</td>
                <td>78</td>
                <td>50</td>
                <td>68.5</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Panel>
    </Grid>
  );
}
