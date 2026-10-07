import { API_URL } from '../utils/sheets';

const COLUMNS = [
  { key: 'method', label: '方法', nowrap: true },
  { key: 'timestamp', label: '日時', nowrap: true },
  { key: 'q1', label: '年代', nowrap: true },
  { key: 'q2', label: '認知経路', minWidth: 140 },
  { key: 'referrer', label: '紹介者', minWidth: 100 },
  { key: 'q3', label: '来場回数', nowrap: true },
  { key: 'q4', label: '印象に残った曲', minWidth: 220 },
  { key: 'q5', label: '一番の1曲', minWidth: 160 },
  { key: 'name', label: 'お名前', minWidth: 100 },
  { key: 'region', label: '地域', minWidth: 110 },
  { key: 'q8', label: '感想', minWidth: 320 },
  { key: 'source', label: '出所', nowrap: true },
  { key: 'note', label: '備考', minWidth: 140 },
];

const METHOD_LABEL = {
  電子: { background: '#dbeafe', color: '#1d4ed8' },
  紙: { background: '#dcfce7', color: '#15803d' },
};

// 原本画像はGAS経由で配信する（GASがオーナー権限で読み出すため、Googleアカウント不要）
const imageUrl = (pw, image) => `${API_URL}?pw=${encodeURIComponent(pw)}&img=${encodeURIComponent(image)}`;

const renderCell = (col, row, pw) => {
  const v = row[col.key];
  if (col.key === 'method' && v) {
    return <span style={{ ...styles.methodLabel, ...(METHOD_LABEL[v] ?? styles.methodOther) }}>{v}</span>;
  }
  if (col.key === 'source' && row.image) {
    return (
      <span style={styles.sourceCell}>
        {v}
        <button
          type="button"
          style={styles.pdfBtn}
          onClick={() => window.open(imageUrl(pw, row.image), '_blank', 'noopener')}
        >
          PDF
        </button>
      </span>
    );
  }
  return v;
};

const DetailTable = ({ rows, pw }) => {
  return (
    <div style={styles.wrap}>
      <p style={styles.note}>※ 紙の回答は［PDF］ボタンで原本を表示できます（氏名・ご住所はマスクしています）</p>
      {/* 列名を sticky にするため、この枠自体を縦横スクロールさせる */}
      <div style={styles.scroller}>
        <table style={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} style={{ ...styles.th, minWidth: col.minWidth }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={i} style={{ background: i % 2 ? '#f6f9fd' : '#fff' }}>
                {COLUMNS.map((col) => (
                  <td key={col.key} style={{ ...styles.td, whiteSpace: col.nowrap ? 'nowrap' : 'pre-wrap' }}>
                    {renderCell(col, row, pw)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const styles = {
  wrap: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
  note: { margin: '0 0 8px', fontSize: 12, color: '#5a7a9a' },
  scroller: {
    flex: 1,
    minHeight: 0,
    overflow: 'auto',
    background: '#fff',
    borderRadius: 12,
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
  },
  table: { borderCollapse: 'separate', borderSpacing: 0, width: '100%', fontSize: 13, color: '#2c3e50' },
  th: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    background: '#e8f0f8',
    color: '#1a3a5c',
    fontWeight: 700,
    fontSize: 12,
    textAlign: 'left',
    padding: '10px 12px',
    whiteSpace: 'nowrap',
    borderBottom: '2px solid #c9d8e8',
  },
  td: {
    padding: '8px 12px',
    verticalAlign: 'top',
    lineHeight: 1.5,
    borderBottom: '1px solid #e3eaf2',
    wordBreak: 'break-word',
  },
  methodLabel: { display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700 },
  methodOther: { background: '#eef2f6', color: '#5a7a9a' },
  sourceCell: { display: 'inline-flex', alignItems: 'center', gap: 8 },
  pdfBtn: {
    padding: '1px 8px',
    fontSize: 11,
    fontWeight: 700,
    color: '#2563eb',
    background: '#fff',
    border: '1px solid #2563eb',
    borderRadius: 4,
    cursor: 'pointer',
    lineHeight: 1.6,
  },
};

export default DetailTable;
