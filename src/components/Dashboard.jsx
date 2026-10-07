import { useState, Fragment } from 'react';
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
import HBarChart from './HBarChart';
import DetailTable from './DetailTable';
import { countBy, countMultiSelect, toChartData } from '../utils/parse';

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

const MINI_TH = { margin: '0 0 2px', fontSize: 11, fontWeight: 700, color: '#1a3a5c' };

const SongProfile = ({ rows, q1Key, q2Key, q3Key, songName }) => {
  const q1Data = toChartData(countBy(rows.map((r) => r[q1Key])));
  const q2Data = toChartData(countMultiSelect(rows.map((r) => r[q2Key])));
  const q3Data = toChartData(countBy(rows.map((r) => r[q3Key])));

  return (
    <div>
      <p style={{ margin: '0 0 10px', fontSize: 13, fontWeight: 700, color: '#5b21b6' }}>
        「{songName}」を特に1番に選んだ方のプロフィール（{rows.length} 件）
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))', gap: '8px 20px' }}>
        <div>
          <p style={MINI_TH}>年代</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={q1Data} margin={{ top: 10, right: 8, left: -24, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
              <Tooltip content={<BarTip />} />
              <Bar isAnimationActive={false} dataKey="value" fill="#2563eb" radius={[2, 2, 0, 0]}
                label={{ position: 'top', fontSize: 9, fill: '#1a3a5c' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div>
          <p style={MINI_TH}>知ったきっかけ</p>
          <HBarChart data={q2Data} height={Math.max(100, q2Data.length * 20 + 16)}
            fill="#16a34a" fontSize={9} radius={2} tooltip={<BarTip />} />
        </div>
        <div>
          <p style={MINI_TH}>来場回数</p>
          <ResponsiveContainer width="100%" height={120}>
            <BarChart data={q3Data} margin={{ top: 10, right: 8, left: -24, bottom: 28 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
              <XAxis dataKey="name" tick={{ fontSize: 9 }} angle={-25} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 9 }} allowDecimals={false} />
              <Tooltip content={<BarTip />} />
              <Bar isAnimationActive={false} dataKey="value" fill="#0891b2" radius={[2, 2, 0, 0]}
                label={{ position: 'top', fontSize: 9, fill: '#1a3a5c' }} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

const Dashboard = ({ pw, initialData, onUnauthorized, onLogout }) => {
  const { loading, error, stats } = useSurvey(pw, initialData, onUnauthorized);
  const [otherOpen, setOtherOpen] = useState(false);
  const [q2OtherOpen, setQ2OtherOpen] = useState(false);
  const [q5OpenSong, setQ5OpenSong] = useState(null);
  const [view, setView] = useState('dashboard'); // 'dashboard' | 'detail'

  const toggleView = () => {
    setView((v) => (v === 'dashboard' ? 'detail' : 'dashboard'));
    window.scrollTo(0, 0);
  };

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
    <div className={view === 'detail' ? 'detail-layout' : undefined} style={styles.bg}>
      {/* ── Header ── */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div style={styles.headerLeft}>
            <span style={styles.headerIcon}>🎵</span>
            <span style={styles.headerTitle}>シニパラ 第14回定期演奏会 アンケート結果</span>
          </div>
          <div style={styles.headerRight}>
            <button onClick={toggleView} style={styles.viewBtn}>
              {view === 'dashboard' ? '明細表示はこちら' : '← ダッシュボードに戻る'}
            </button>
            <div style={styles.totalBadge}>
              回答総数　<strong style={{ fontSize: 22 }}>{stats.total}</strong>　件
              <span style={styles.methodBreakdown}>
                （電子 {stats.byMethod.digital}件／紙 {stats.byMethod.paper}件）
              </span>
            </div>
            <button onClick={onLogout} style={styles.logoutBtn}>ログアウト</button>
          </div>
        </div>
      </header>

      {view === 'detail' ? (
        <main style={{ ...styles.main, ...styles.mainDetail }}>
          <DetailTable rows={stats.details} pw={pw} />
        </main>
      ) : (
      <main style={styles.main}>
        <div style={styles.grid}>

          {/* 年代 */}
          <StatCard title="年代">
            <ResponsiveContainer width="100%" height={CHART_H}>
              <BarChart data={stats.q1} margin={{ top: 16, right: 12, left: -16, bottom: 48 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
                <XAxis dataKey="name" tick={{ fontSize: 12 }} angle={-30} textAnchor="end" interval={0} />
                <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                <Tooltip content={<BarTip />} />
                <Bar isAnimationActive={false} dataKey="value" fill="#2563eb" radius={[4, 4, 0, 0]}
                  label={{ position: 'top', fontSize: 12, fill: '#1a3a5c', fontWeight: 700 }} />
              </BarChart>
            </ResponsiveContainer>
          </StatCard>

          {/* 来場回数 */}
          <StatCard title="来場回数">
            <ResponsiveContainer width="100%" height={PIE_H}>
              <PieChart>
                <Pie isAnimationActive={false} data={stats.q3} cx="50%" cy="40%" outerRadius={80}
                  dataKey="value" labelLine={false} label={renderCustomLabel}>
                  {stats.q3.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<PieTip />} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </StatCard>

          {/* 知ったきっかけ */}
          <StatCard title="知ったきっかけ">
            <p style={styles.note}>※複数回答あり</p>
            <HBarChart data={stats.q2.data} height={Math.max(CHART_H, stats.q2.data.length * 36 + 24)}
              fill="#16a34a" fontSize={11} labelFontSize={12} tooltip={<BarTip />} />
            {stats.q2.otherCount > 0 && (
              <div style={styles.q2Other}>
                <button style={styles.otherToggle} onClick={() => setQ2OtherOpen((o) => !o)}>
                  <span>その他（{stats.q2.otherCount} 件）</span>
                  <span style={{ fontSize: 11 }}>{q2OtherOpen ? '▲ 閉じる' : '▼ 一覧を見る'}</span>
                </button>
                {q2OtherOpen && (
                  stats.q2.otherList.length === 0 ? (
                    <p style={{ margin: 0, padding: '4px 16px 12px', fontSize: 13, color: '#999' }}>記入がありません</p>
                  ) : (
                    <ul style={styles.otherList}>
                      {stats.q2.otherList.map((text, i) => (
                        <li key={i} style={styles.otherItem}>{text}</li>
                      ))}
                    </ul>
                  )
                )}
              </div>
            )}
          </StatCard>

          {/* 紹介者一覧 */}
          <StatCard title="紹介者一覧">
            <p style={styles.note}>「団員から直接」を選んだ方の記入内容（{stats.referrers.length} 件）</p>
            {stats.referrers.length === 0 ? (
              <p style={{ color: '#999' }}>記入がありません</p>
            ) : (
              <ul style={{ ...styles.commentList, maxHeight: CHART_H + 40, overflowY: 'auto' }}>
                {stats.referrers.map((text, i) => (
                  <li key={i} style={{ ...styles.commentItem, borderLeftColor: '#16a34a' }}>
                    <span style={{ ...styles.commentIndex, color: '#16a34a' }}>{i + 1}</span>
                    <span style={styles.commentText}>{text}</span>
                  </li>
                ))}
              </ul>
            )}
          </StatCard>

          {/* 地域分布（全幅） */}
          <StatCard title="地域分布" style={{ gridColumn: '1 / -1' }}>
            {stats.region.length === 0 ? (
              <p style={{ color: '#999' }}>回答がありません</p>
            ) : (
              <HBarChart data={stats.region} height={Math.max(CHART_H, stats.region.length * 30 + 24)}
                fill="#0891b2" tooltip={<BarTip />} />
            )}
          </StatCard>

          {/* 曲の人気ランキング（全幅） */}
          <StatCard title="曲の人気ランキング" style={{ gridColumn: '1 / -1' }}>
            <p style={styles.note}>印象に残った曲（複数回答） ／ 一番印象に残った1曲（自由記述）</p>
            <table style={styles.rankTable}>
              <thead>
                <tr>
                  <th style={styles.rankTh}>順位</th>
                  <th style={{ ...styles.rankTh, textAlign: 'left', paddingLeft: 16 }}>曲名</th>
                  <th style={styles.rankTh}>
                    印象に残った<br />
                    <span style={styles.rankThSub}>複数回答</span>
                  </th>
                  <th style={styles.rankTh}>
                    特に1番<br />
                    <span style={styles.rankThSub}>1択</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.songRanking.rows.map((row, i) => (
                  <Fragment key={row.name}>
                    <tr style={i % 2 === 0 ? styles.rankRowEven : styles.rankRowOdd}>
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
                        {row.q4Count > 0 ? `${row.q4Count} 票` : '—'}
                      </td>
                      <td style={{ ...styles.rankTd, color: '#7c3aed', fontWeight: 700 }}>
                        {row.q5Count > 0 ? (
                          <button
                            style={styles.q5CountBtn}
                            onClick={() => setQ5OpenSong(q5OpenSong === row.name ? null : row.name)}
                          >
                            {row.q5Count} 件
                            <span style={{ fontSize: 10 }}>{q5OpenSong === row.name ? '▲' : '▼'}</span>
                          </button>
                        ) : '—'}
                      </td>
                    </tr>
                    {q5OpenSong === row.name && (
                      <tr style={styles.rankRowOther}>
                        <td colSpan={4} style={{ padding: '8px 20px 16px' }}>
                          <SongProfile
                            rows={row.q5Rows}
                            q1Key={stats.keys.q1}
                            q2Key={stats.keys.q2}
                            q3Key={stats.keys.q3}
                            songName={row.name}
                          />
                        </td>
                      </tr>
                    )}
                  </Fragment>
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

          {/* ご感想・ご要望（全幅） */}
          <StatCard title="ご感想・ご要望" style={{ gridColumn: '1 / -1' }}>
            {stats.comments.length === 0 ? (
              <p style={{ color: '#999' }}>回答がありません</p>
            ) : (
              <ul style={{ ...styles.commentList, maxHeight: 360, overflowY: 'auto' }}>
                {stats.comments.map((c, i) => (
                  <li key={i} style={styles.commentItem}>
                    <span style={styles.commentIndex}>{i + 1}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <span style={styles.commentText}>{c.text}</span>
                      <p style={styles.commentName}>
                        {c.note && (
                          <span title={`要確認: ${c.note}`} style={styles.commentNote}>⚠</span>
                        )}
                        — {c.name}
                        {c.source && <span style={styles.commentSource}>{'\u3000'}（{c.source}）</span>}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </StatCard>

        </div>
      </main>
      )}
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
  mainDetail: { maxWidth: 'none', flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' },
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
    flexWrap: 'wrap',
    gap: '8px 20px',
  },
  // 幅が足りないときは右側（件数・ログアウト）を次の行に送り、タイトルを潰さない
  headerLeft: { display: 'flex', alignItems: 'center', gap: 10, flex: '1 1 auto', minWidth: 0 },
  headerRight: { display: 'flex', alignItems: 'center', gap: '8px 20px', flexShrink: 0, flexWrap: 'wrap', maxWidth: '100%' },
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
  viewBtn: {
    background: '#2563eb',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.35)',
    borderRadius: 6,
    padding: '7px 16px',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
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
    // 2列。カードが狭くなりすぎる幅では1列にする
    gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 440px), 1fr))',
    gap: '16px',
  },
  note: { margin: '0 0 6px', fontSize: 12, color: '#7a9ab8' },
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
  q5CountBtn: {
    background: 'none', border: 'none', cursor: 'pointer',
    color: '#7c3aed', fontWeight: 700, fontSize: 14,
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 6px', borderRadius: 4, textDecoration: 'underline',
    textDecorationStyle: 'dotted', textUnderlineOffset: 3,
  },
  q2Other: { marginTop: 8, background: '#faf5ff', borderRadius: 8 },
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
  commentName: { margin: '4px 0 0', fontSize: 12, color: '#5a7a9a', textAlign: 'right' },
  commentSource: { fontSize: 11, color: '#8aa0b5' },
  commentNote: { marginRight: 6, color: '#d97706', cursor: 'help' },
  methodBreakdown: { fontSize: 13, marginLeft: 4 },
  commentText: { fontSize: 14, color: '#2c3e50', lineHeight: 1.5, whiteSpace: 'pre-wrap', wordBreak: 'break-word' },
};

export default Dashboard;
