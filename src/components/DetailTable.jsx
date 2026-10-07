import { useState } from 'react';
import { API_URL } from '../utils/sheets';

const COLUMNS = [
  { key: 'method', label: '方法', nowrap: true },
  { key: 'timestamp', label: '日時', nowrap: true },
  { key: 'q1', label: '年代', nowrap: true },
  { key: 'q2', label: '知ったきっかけ', minWidth: 140 },
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

// カードでは方法・日時を上端に出し、残りを「項目名：値」で並べる
const CARD_FIELDS = COLUMNS.filter((c) => c.key !== 'method' && c.key !== 'timestamp');

const SORT_KEYS = [
  { key: null, label: '標準' },
  { key: 'timestamp', label: '日時' },
  { key: 'q2', label: '知ったきっかけ' },
  { key: 'referrer', label: '紹介者' },
  { key: 'q5', label: '一番の1曲' },
];

const METHOD_LABEL = {
  電子: { background: '#dbeafe', color: '#1d4ed8' },
  紙: { background: '#dcfce7', color: '#15803d' },
};

// 原本画像はGAS経由で配信する（GASがオーナー権限で読み出すため、Googleアカウント不要）
const imageUrl = (pw, image) => `${API_URL}?pw=${encodeURIComponent(pw)}&img=${encodeURIComponent(image)}`;

// 空の値は昇順・降順にかかわらず末尾。同値はAPIの順序を保つ
const sortRows = (rows, { key, dir }) => {
  if (!key) return rows;
  const sign = dir === 'desc' ? -1 : 1;
  return rows
    .map((row, i) => ({ row, i }))
    .sort((a, b) => {
      const va = a.row[key], vb = b.row[key];
      if (!va || !vb) return (!va - !vb) || a.i - b.i;
      return sign * va.localeCompare(vb, 'ja') || a.i - b.i;
    })
    .map(({ row }) => row);
};

// 方法：画像のある紙の回答は［PDF］ボタン、それ以外はラベル
const MethodCell = ({ row, pw }) => {
  if (row.method === '紙' && row.image) {
    return (
      <button
        type="button"
        style={styles.pdfBtn}
        onClick={() => window.open(imageUrl(pw, row.image), '_blank', 'noopener')}
      >
        PDF
      </button>
    );
  }
  if (!row.method) return null;
  return <span style={{ ...styles.methodLabel, ...(METHOD_LABEL[row.method] ?? styles.methodOther) }}>{row.method}</span>;
};

const DetailTable = ({ rows, pw }) => {
  const [sort, setSort] = useState({ key: null, dir: 'asc' });

  const handleSort = (key) => {
    if (!key) setSort({ key: null, dir: 'asc' });
    else if (sort.key === key) setSort({ key, dir: sort.dir === 'asc' ? 'desc' : 'asc' });
    else setSort({ key, dir: 'asc' });
  };

  const sorted = sortRows(rows, sort);

  return (
    <div style={styles.wrap}>
      <p style={styles.note}>※ 紙の回答は［PDF］ボタンで原本を表示できます（氏名・ご住所はマスクしています）</p>

      <div style={styles.sortBar}>
        {SORT_KEYS.map(({ key, label }) => {
          const active = sort.key === key;
          return (
            <button
              key={label}
              type="button"
              onClick={() => handleSort(key)}
              style={{ ...styles.sortBtn, ...(active && styles.sortBtnActive) }}
            >
              {label}{active && key && (sort.dir === 'asc' ? ' ▲' : ' ▼')}
            </button>
          );
        })}
      </div>

      {/* 768px以上：表。列名を sticky にするため、この枠自体を縦横スクロールさせる */}
      <div className="detail-table" style={styles.scroller}>
        <table style={styles.table}>
          <thead>
            <tr>
              {COLUMNS.map((col) => (
                <th key={col.key} style={{ ...styles.th, minWidth: col.minWidth }}>{col.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {sorted.map((row, i) => (
              <tr key={i} style={{ background: i % 2 ? '#f6f9fd' : '#fff' }}>
                {COLUMNS.map((col) => (
                  <td key={col.key} style={{ ...styles.td, whiteSpace: col.nowrap ? 'nowrap' : 'pre-wrap' }}>
                    {col.key === 'method' ? <MethodCell row={row} pw={pw} /> : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 768px未満：カード。値が空の項目は行ごと出さない */}
      <ul className="detail-cards" style={styles.cardList}>
        {sorted.map((row, i) => (
          <li key={i} style={styles.card}>
            <div style={styles.cardHead}>
              <MethodCell row={row} pw={pw} />
              {row.timestamp && <span style={styles.cardTime}>{row.timestamp}</span>}
            </div>
            <dl style={styles.cardBody}>
              {CARD_FIELDS.filter((f) => row[f.key]).map((f) => (
                <div key={f.key} style={styles.cardRow}>
                  <dt style={styles.cardLabel}>{f.label}：</dt>
                  <dd style={styles.cardValue}>{row[f.key]}</dd>
                </div>
              ))}
            </dl>
          </li>
        ))}
      </ul>
    </div>
  );
};

const styles = {
  wrap: { flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
  note: { margin: '0 0 8px', fontSize: 12, color: '#5a7a9a' },
  sortBar: { display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  sortBtn: {
    minHeight: 36,
    padding: '6px 14px',
    fontSize: 13,
    fontWeight: 700,
    color: '#1a3a5c',
    background: '#fff',
    border: '1px solid #c9d8e8',
    borderRadius: 18,
    cursor: 'pointer',
  },
  sortBtnActive: { color: '#fff', background: '#2563eb', borderColor: '#2563eb' },
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
  methodLabel: { display: 'inline-block', padding: '2px 8px', borderRadius: 10, fontSize: 11, fontWeight: 700, lineHeight: 1.6 },
  methodOther: { background: '#eef2f6', color: '#5a7a9a' },
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
  cardList: { listStyle: 'none', margin: 0, padding: 0, flexDirection: 'column', gap: 12 },
  card: {
    background: '#fff',
    border: '1px solid #dbe5f0',
    borderRadius: 10,
    padding: '12px 14px',
    boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
  },
  cardHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    paddingBottom: 8,
    marginBottom: 8,
    borderBottom: '1px solid #e3eaf2',
  },
  cardTime: { fontSize: 12, color: '#5a7a9a' },
  cardBody: { margin: 0, display: 'flex', flexDirection: 'column', gap: 4 },
  cardRow: { display: 'flex', gap: 4, fontSize: 13, lineHeight: 1.5, color: '#2c3e50' },
  cardLabel: { flexShrink: 0, fontWeight: 700, color: '#1a3a5c' },
  cardValue: { margin: 0, minWidth: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
};

export default DetailTable;
