import { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { useSurvey } from '../hooks/useSurvey';
import StatCard from './StatCard';

const COLORS = [
  '#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed',
  '#0891b2', '#db2777', '#65a30d', '#ea580c', '#6366f1',
];

const RADIAN = Math.PI / 180;
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
  if (percent < 0.06) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const BarTip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={TIP}>
      <p style={{ margin: 0, fontWeight: 700, color: '#1a3a5c' }}>{label}</p>
      <p style={{ margin: '2px 0 0', color: '#2563eb' }}>{payload[0].value} 件</p>
    </div>
  );
};

const PieTip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={TIP}>
      <p style={{ margin: 0, fontWeight: 700, color: '#1a3a5c' }}>{payload[0].name}</p>
      <p style={{ margin: '2px 0 0', color: '#2563eb' }}>{payload[0].value} 件</p>
    </div>
  );
};

const TIP = {
  background: '#fff', border: '1px solid #dde',
  borderRadius: 8, padding: '8px 14px', fontSize: 14,
};

const CHART_H = 240;
const PIE_H = 280;

const Dashboard = ({ onLogout }) => {
  const { loading, error, stats } = useSurvey();
  const [otherOpen, setOtherOpen] = useState(false);

  if (loading) {
    return (
      <div style={styles.center}>
        <div style={styles.spinner} />
        <p style={{ fontSize: 18, color: '#5a7a9a', marginTop: 16 }}>データを読み込んでいます...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={styles.center}>
        <p style={{ fontSize: 18, color: '#c0392b' }}>エラー: {error}</p>
      </div>
    );
  }

  return (
    <div style={styles.bg}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={styles.headerIcon}>🎵</span>
            <span style={styles.headerTitle}>シニパラ サマコン2026 アンケート結果</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <div style={styles.totalBadge}>
              回答総数　<strong style={{ fontSize: 22 }}>{stats.total}</strong>　件
            </div>
            <button onClick={onLogout} style={styles.logoutBtn}>ログアウト</button>
          </div>
        </div>
      </header>

      {/* ── Grid ── */}
      <main style={styles.main}>
        <div style={styles.grid}>

          {/* Q1: 年代 */}
          <StatCard title={`Q1　${stats.q1.label}`}>
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={stats.q1.data} margin={{ top: 16, right: 12, left: -16, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<BarTip />} />
                <Bar dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fontSize: 12, fill: '#1a3a5c', fontWeight: 700 }} />
              </BarChart>
            </ResponsiveContainer>
          </StatCard>

          {/* Q2: 来場経路 */}
          <StatCard title={`Q2　${stats.q2.label}`}>
            <p style={styles.note}>※複数回答あり</p>
            <ResponsiveContainer width="100%" height={Math.max(CHART_H, stats.q2.data.length * 36 + 24)}>
              <BarChart data={stats.q2.data} layout="vertical" margin={{ top: 4, right: 48, left: 4, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 12 }} allowDecimals={false} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={140} />
                <Tooltip content={<BarTip />} />
                <Bar dataKey="value" fill="#16a34a" radius={[0, 4, 4, 0]}
                  label={{ position: 'right', fontSize: 12, fill: '#1a3a5c', fontWeight: 700 }} />
              </BarChart>
            </ResponsiveContainer>
          </StatCard>

          {/* Q3: 来場回数 */}
          <StatCard title={`Q3　${stats.q3.label}`}>
            <ResponsiveContainer width="100%" height={PIE_H}>
              <PieChart>
                <Pie data={stats.q3.data} cx="50%" cy="40%" outerRadius={80}
                  dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {stats.q3.data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </StatCard>

          {/* Q4: 満足度 */}
          <StatCard title={`Q4　${stats.q4.label}`}>
            <div style={styles.avgRow}>
              <span style={styles.avgNum}>{stats.q4.avg.toFixed(2)}</span>
              <span style={styles.avgDenom}>/ 5 点</span>
              <span style={styles.avgSub}>平均（{stats.q4.nums.length} 件）</span>
            </div>
            <ResponsiveContainer width="100%" height={130}>
              <BarChart data={stats.q4.dist} margin={{ top: 12, right: 12, left: -16, bottom: 4 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<BarTip />} />
                <Bar dataKey="value" fill="#d97706" radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fontSize: 12, fill: '#1a3a5c', fontWeight: 700 }} />
              </BarChart>
            </ResponsiveContainer>
          </StatCard>

          {/* 曲の人気ランキング（Q5+Q6統合・全幅） */}
          <StatCard title="曲の人気ランキング" style={{ gridColumn: '1 / -1' }}>
            <p style={styles.note}>Q5: 印象に残った曲（複数回答） ／ Q6: 一番印象に残った1曲（自由記述）</p>
            <table style={styles.rankTable}>
              <thead>
                <tr>
                  <th style={styles.rankTh}>順位</th>
                  <th style={{ ...styles.rankTh, textAlign: 'left', paddingLeft: 16 }}>曲名</th>
                  <th style={styles.rankTh}>
                    印象に残った<br />
                    <span style={styles.rankThSub}>Q5・複数回答</span>
                  </th>
                  <th style={styles.rankTh}>
                    特に1番<br />
                    <span style={styles.rankThSub}>Q6・1択</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.songRanking.rows.map((row, i) => (
                  <tr key={row.name} style={i % 2 === 0 ? styles.rankRowEven : styles.rankRowOdd}>
                    <td style={styles.rankTd}>
                      <span style={{
                        ...styles.rankBadge,
                        background: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : '#e0e7ef',
                        color: i < 3 ? '#fff' : '#2c4a6e',
                      }}>
                        {i + 1}
                      </span>
                    </td>
                    <td style={{ ...styles.rankTd, textAlign: 'left', paddingLeft: 16, fontWeight: 600, color: '#1a3a5c' }}>
                      {row.name}
                    </td>
                    <td style={{ ...styles.rankTd, color: '#2563eb', fontWeight: 700 }}>
                      {row.q5Count > 0 ? `${row.q5Count} 票` : '—'}
                    </td>
                    <td style={{ ...styles.rankTd, color: '#7c3aed', fontWeight: 700 }}>
                      {row.q6Count > 0 ? `${row.q6Count} 件` : '—'}
                    </td>
                  </tr>
                ))}
                {stats.songRanking.otherList.length > 0 && (
                  <tr style={styles.rankRowOther}>
                    <td colSpan={4} style={{ padding: 0 }}>
                      <button
                        style={styles.otherToggle}
                        onClick={() => setOtherOpen((o) => !o)}
                      >
                        <span>その他（{stats.songRanking.otherList.length} 件）</span>
                        <span style={{ fontSize: 11 }}>{otherOpen ? '▲ 閉じる' : '▼ 一覧を見る'}</span>
                      </button>
                      {otherOpen && (
                        <ul style={styles.otherList}>
                          {stats.songRanking.otherList.map((text, i) => (
                            <li key={i} style={styles.otherItem}>{text}</li>
                          ))}
                        </ul>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </StatCard>

          {/* Q7: 定演来場意向 */}
          <StatCard title={`Q7　${stats.q7.label}`}>
            <ResponsiveContainer width="100%" height={PIE_H}>
              <PieChart>
                <Pie data={stats.q7.data} cx="50%" cy="40%" outerRadius={80}
                  dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {stats.q7.data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </StatCard>

          {/* Q8: 自由記述（全幅） */}
          <StatCard title={`Q8　${stats.q8.label}`} style={{ gridColumn: '1 / -1' }}>
            {stats.q8.list.length === 0 ? (
              <p style={{ color: '#999' }}>回答がありません</p>
            ) : (
              <ul style={{ ...styles.commentList, maxHeight: 360, overflowY: 'auto' }}>
                {stats.q8.list.map((text, i) => (
                  <li key={i} style={styles.commentItem}>
                    <span style={styles.commentIndex}>{i + 1}</span>
                    <span style={styles.commentText}>{String(text)}</span>
                  </li>
                ))}
              </ul>
            )}
          </StatCard>

        </div>
      </main>
    </div>
  );
};

const styles = {
  bg: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: '#f0f4fa',
  },
  center: {
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 44,
    height: 44,
    border: '5px solid #dde',
    borderTop: '5px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
  },
  header: {
    background: '#1a3a5c',
    color: '#fff',
    flexShrink: 0,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  headerInner: {
    maxWidth: 1280,
    margin: '0 auto',
    padding: '12px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: { fontSize: 22 },
  headerTitle: { fontSize: '17px', fontWeight: '700' },
  totalBadge: {
    background: 'rgba(255,255,255,0.15)',
    border: '1px solid rgba(255,255,255,0.3)',
    borderRadius: 8,
    padding: '6px 16px',
    fontSize: 15,
    color: '#fff',
    whiteSpace: 'nowrap',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.12)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: 6,
    padding: '7px 16px',
    fontSize: 14,
    cursor: 'pointer',
  },
  main: {
    padding: '16px',
    maxWidth: 1280,
    width: '100%',
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '16px',
  },
  note: { margin: '0 0 6px', fontSize: 12, color: '#7a9ab8' },
  avgRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    marginBottom: 4,
  },
  avgNum: { fontSize: 36, fontWeight: 800, color: '#2563eb', lineHeight: 1 },
  avgDenom: { fontSize: 16, color: '#5a7a9a' },
  avgSub: { fontSize: 13, color: '#7a9ab8' },
  rankBadge: {
    minWidth: 26, height: 26, borderRadius: '50%',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontWeight: 800, fontSize: 13, flexShrink: 0,
  },
  rankTable: { width: '100%', borderCollapse: 'collapse', fontSize: 14 },
  rankTh: {
    padding: '8px 12px', background: '#e8eef7', color: '#1a3a5c',
    fontWeight: 700, fontSize: 12, textAlign: 'center',
    borderBottom: '2px solid #c5d3e8',
  },
  rankThSub: { fontSize: 10, fontWeight: 400, color: '#5a7a9a' },
  rankTd: {
    padding: '9px 12px', textAlign: 'center',
    borderBottom: '1px solid #edf0f7', verticalAlign: 'middle',
  },
  rankRowEven: { background: '#fff' },
  rankRowOdd: { background: '#f8fafd' },
  rankRowOther: { background: '#faf5ff' },
  otherToggle: {
    width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 16px', border: 'none', background: 'transparent',
    cursor: 'pointer', fontSize: 14, fontWeight: 600, color: '#7c3aed',
  },
  otherList: {
    listStyle: 'none', padding: '4px 16px 12px', margin: 0,
    display: 'flex', flexWrap: 'wrap', gap: 6,
  },
  otherItem: {
    padding: '3px 10px', background: '#ede9fe', borderRadius: 20,
    fontSize: 13, color: '#5b21b6',
  },
  commentList: {
    listStyle: 'none', padding: 0, margin: 0,
    display: 'flex', flexDirection: 'column', gap: 6,
  },
  commentItem: {
    display: 'flex', alignItems: 'flex-start', gap: 12,
    padding: '8px 14px', background: '#f4f7fb',
    borderRadius: 8, borderLeft: '3px solid #2563eb',
  },
  commentIndex: { minWidth: 24, fontSize: 12, fontWeight: 700, color: '#2563eb', paddingTop: 2 },
  commentText: { fontSize: 14, color: '#2c3e50', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
};

export default Dashboard;
