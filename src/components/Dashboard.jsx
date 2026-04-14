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
const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }) => {
  if (percent < 0.05) return null;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.55;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const CustomBarTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #dde', borderRadius: 8, padding: '10px 16px', fontSize: 15 }}>
      <p style={{ margin: 0, fontWeight: 700, color: '#1a3a5c' }}>{label}</p>
      <p style={{ margin: '4px 0 0', color: '#2563eb' }}>{payload[0].value} 件</p>
    </div>
  );
};

const CustomPieTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#fff', border: '1px solid #dde', borderRadius: 8, padding: '10px 16px', fontSize: 15 }}>
      <p style={{ margin: 0, fontWeight: 700, color: '#1a3a5c' }}>{payload[0].name}</p>
      <p style={{ margin: '4px 0 0', color: '#2563eb' }}>{payload[0].value} 件</p>
    </div>
  );
};

const Dashboard = ({ onLogout }) => {
  const { loading, error, stats } = useSurvey();

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
      {/* Header */}
      <header style={styles.header}>
        <div style={styles.headerInner}>
          <div>
            <span style={styles.headerIcon}>🎵</span>
            <span style={styles.headerTitle}>シニパラ サマコン2026 アンケート結果</span>
          </div>
          <button onClick={onLogout} style={styles.logoutBtn}>ログアウト</button>
        </div>
      </header>

      <main style={styles.main}>
        {/* 回答総数 */}
        <div style={styles.totalBanner}>
          <span style={styles.totalLabel}>回答総数</span>
          <span style={styles.totalNum}>{stats.total}</span>
          <span style={styles.totalUnit}>件</span>
        </div>

        {/* Q1: 年代 */}
        <StatCard title={`Q1　${stats.q1.label}`}>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={stats.q1.data} margin={{ top: 8, right: 16, left: 0, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
              <XAxis dataKey="name" tick={{ fontSize: 14 }} angle={-30} textAnchor="end" interval={0} />
              <YAxis tick={{ fontSize: 14 }} allowDecimals={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="value" fill="#2563eb" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 14, fill: '#1a3a5c', fontWeight: 600 }} />
            </BarChart>
          </ResponsiveContainer>
        </StatCard>

        {/* Q2: 来場経路 */}
        <StatCard title={`Q2　${stats.q2.label}`}>
          <p style={styles.note}>※複数回答あり</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={stats.q2.data} layout="vertical" margin={{ top: 8, right: 48, left: 8, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 14 }} allowDecimals={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 14 }} width={160} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="value" fill="#16a34a" radius={[0, 6, 6, 0]} label={{ position: 'right', fontSize: 14, fill: '#1a3a5c', fontWeight: 600 }} />
            </BarChart>
          </ResponsiveContainer>
        </StatCard>

        {/* Q3: 来場回数 */}
        <StatCard title={`Q3　${stats.q3.label}`}>
          <div style={styles.pieWrap}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.q3.data}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {stats.q3.data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend wrapperStyle={{ fontSize: 15, paddingTop: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </StatCard>

        {/* Q4: 満足度 */}
        <StatCard title={`Q4　${stats.q4.label}`}>
          <div style={styles.satisfyRow}>
            <div style={styles.avgBox}>
              <span style={styles.avgNum}>{stats.q4.avg.toFixed(2)}</span>
              <span style={styles.avgDenom}>/ {Math.max(...stats.q4.nums.map(Number), 5)} 点</span>
            </div>
            <div style={styles.avgSub}>平均スコア（{stats.q4.nums.length} 件）</div>
          </div>
          <p style={{ fontSize: 15, color: '#5a7a9a', margin: '0 0 8px' }}>スコア分布</p>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={stats.q4.dist} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eef" />
              <XAxis dataKey="name" tick={{ fontSize: 14 }} />
              <YAxis tick={{ fontSize: 14 }} allowDecimals={false} />
              <Tooltip content={<CustomBarTooltip />} />
              <Bar dataKey="value" fill="#d97706" radius={[6, 6, 0, 0]} label={{ position: 'top', fontSize: 14, fill: '#1a3a5c', fontWeight: 600 }} />
            </BarChart>
          </ResponsiveContainer>
        </StatCard>

        {/* Q5: 印象に残った曲 */}
        <StatCard title={`Q5　${stats.q5.label}`}>
          {stats.q5.data.length === 0 ? (
            <p style={{ color: '#999' }}>データがありません</p>
          ) : (
            <ol style={styles.rankList}>
              {stats.q5.data.map((item, i) => (
                <li key={i} style={styles.rankItem}>
                  <span style={{ ...styles.rankBadge, background: i === 0 ? '#f59e0b' : i === 1 ? '#9ca3af' : i === 2 ? '#b45309' : '#e0e7ef', color: i < 3 ? '#fff' : '#2c4a6e' }}>
                    {i + 1}
                  </span>
                  <span style={styles.rankName}>{item.name}</span>
                  <span style={styles.rankCount}>{item.value} 票</span>
                </li>
              ))}
            </ol>
          )}
        </StatCard>

        {/* Q6: 定演来場意向 */}
        <StatCard title={`Q6　${stats.q6.label}`}>
          <div style={styles.pieWrap}>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.q6.data}
                  cx="50%"
                  cy="50%"
                  outerRadius={110}
                  dataKey="value"
                  labelLine={false}
                  label={renderCustomLabel}
                >
                  {stats.q6.data.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
                <Legend wrapperStyle={{ fontSize: 15, paddingTop: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </StatCard>

        {/* Q7: 自由記述 */}
        <StatCard title={`Q7　${stats.q7.label}`}>
          {stats.q7.list.length === 0 ? (
            <p style={{ color: '#999' }}>回答がありません</p>
          ) : (
            <ul style={styles.commentList}>
              {stats.q7.list.map((text, i) => (
                <li key={i} style={styles.commentItem}>
                  <span style={styles.commentIndex}>{i + 1}</span>
                  <span style={styles.commentText}>{String(text)}</span>
                </li>
              ))}
            </ul>
          )}
        </StatCard>
      </main>
    </div>
  );
};

const styles = {
  bg: {
    minHeight: '100vh',
    background: '#f0f4fa',
  },
  center: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  spinner: {
    width: 48,
    height: 48,
    border: '5px solid #dde',
    borderTop: '5px solid #2563eb',
    borderRadius: '50%',
    animation: 'spin 0.9s linear infinite',
  },
  header: {
    background: '#1a3a5c',
    color: '#fff',
    padding: '0',
    position: 'sticky',
    top: 0,
    zIndex: 100,
    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
  },
  headerInner: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '16px 20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerIcon: {
    fontSize: 24,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: '18px',
    fontWeight: '700',
    verticalAlign: 'middle',
  },
  logoutBtn: {
    background: 'rgba(255,255,255,0.15)',
    color: '#fff',
    border: '1px solid rgba(255,255,255,0.4)',
    borderRadius: 6,
    padding: '8px 18px',
    fontSize: 15,
    cursor: 'pointer',
  },
  main: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '24px 16px 48px',
  },
  totalBanner: {
    background: 'linear-gradient(135deg, #1a3a5c 0%, #2563eb 100%)',
    borderRadius: 14,
    padding: '24px 32px',
    marginBottom: 24,
    display: 'flex',
    alignItems: 'baseline',
    gap: 12,
    color: '#fff',
    boxShadow: '0 4px 16px rgba(37,99,235,0.3)',
  },
  totalLabel: {
    fontSize: 20,
    fontWeight: 600,
    opacity: 0.9,
  },
  totalNum: {
    fontSize: 56,
    fontWeight: 800,
    lineHeight: 1,
  },
  totalUnit: {
    fontSize: 22,
    fontWeight: 600,
    opacity: 0.9,
  },
  note: {
    margin: '0 0 12px',
    fontSize: 14,
    color: '#7a9ab8',
  },
  pieWrap: {
    display: 'flex',
    justifyContent: 'center',
  },
  satisfyRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 10,
    marginBottom: 16,
  },
  avgBox: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 4,
  },
  avgNum: {
    fontSize: 52,
    fontWeight: 800,
    color: '#2563eb',
    lineHeight: 1,
  },
  avgDenom: {
    fontSize: 20,
    color: '#5a7a9a',
  },
  avgSub: {
    fontSize: 16,
    color: '#7a9ab8',
  },
  rankList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  rankItem: {
    display: 'flex',
    alignItems: 'center',
    gap: 14,
    padding: '10px 16px',
    background: '#f4f7fb',
    borderRadius: 10,
  },
  rankBadge: {
    minWidth: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 800,
    fontSize: 15,
  },
  rankName: {
    flex: 1,
    fontSize: 16,
    color: '#1a3a5c',
    fontWeight: 600,
  },
  rankCount: {
    fontSize: 16,
    color: '#2563eb',
    fontWeight: 700,
  },
  commentList: {
    listStyle: 'none',
    padding: 0,
    margin: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  commentItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 14,
    padding: '12px 16px',
    background: '#f4f7fb',
    borderRadius: 10,
    borderLeft: '4px solid #2563eb',
  },
  commentIndex: {
    minWidth: 28,
    fontSize: 14,
    fontWeight: 700,
    color: '#2563eb',
    paddingTop: 2,
  },
  commentText: {
    fontSize: 16,
    color: '#2c3e50',
    lineHeight: 1.6,
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
};

export default Dashboard;
