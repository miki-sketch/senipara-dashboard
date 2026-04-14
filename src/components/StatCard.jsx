const StatCard = ({ title, children }) => (
  <div style={styles.card}>
    <h2 style={styles.title}>{title}</h2>
    <div style={styles.body}>{children}</div>
  </div>
);

const styles = {
  card: {
    background: '#fff',
    borderRadius: '14px',
    boxShadow: '0 2px 12px rgba(0,0,0,0.08)',
    padding: '28px 24px',
    marginBottom: '24px',
  },
  title: {
    fontSize: '18px',
    fontWeight: '700',
    color: '#1a3a5c',
    margin: '0 0 20px',
    paddingBottom: '12px',
    borderBottom: '2px solid #e8f0f8',
  },
  body: {
    fontSize: '16px',
    color: '#333',
  },
};

export default StatCard;
