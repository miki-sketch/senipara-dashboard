const StatCard = ({ title, children, style }) => (
  <div style={{ ...styles.card, ...style }}>
    <h2 style={styles.title}>{title}</h2>
    <div style={styles.body}>{children}</div>
  </div>
);

const styles = {
  card: {
    background: '#fff',
    borderRadius: '12px',
    boxShadow: '0 2px 10px rgba(0,0,0,0.07)',
    padding: '16px 18px',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  title: {
    fontSize: '15px',
    fontWeight: '700',
    color: '#1a3a5c',
    margin: '0 0 12px',
    paddingBottom: '10px',
    borderBottom: '2px solid #e8f0f8',
    flexShrink: 0,
  },
  body: {
    fontSize: '15px',
    color: '#333',
    flex: 1,
    minHeight: 0,
  },
};

export default StatCard;
