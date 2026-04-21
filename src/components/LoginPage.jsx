import { useState } from 'react';
import { fetchCredentials } from '../utils/sheets';

const LoginPage = ({ onLogin }) => {
  const [user, setUser] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const creds = await fetchCredentials();

if (user.trim() === creds.user && pass.trim() === creds.pass) {
        onLogin();
      } else {
        setError('ユーザー名またはパスワードが正しくありません');
      }
    } catch {
      setError('認証情報の取得に失敗しました。しばらくしてから再試行してください。');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.bg}>
      <div style={styles.card}>
        <div style={styles.logo}>🎵</div>
        <h1 style={styles.title}>シニパラ サマコン2026</h1>
        <p style={styles.subtitle}>アンケート結果ダッシュボード</p>
        <form onSubmit={handleSubmit} style={styles.form}>
          <label style={styles.label}>ユーザー名</label>
          <input
            type="text"
            value={user}
            onChange={(e) => setUser(e.target.value)}
            style={styles.input}
            autoComplete="username"
            required
          />
          <label style={styles.label}>パスワード</label>
          <input
            type="password"
            value={pass}
            onChange={(e) => setPass(e.target.value)}
            style={styles.input}
            autoComplete="current-password"
            required
          />
          {error && <p style={styles.error}>{error}</p>}
          <button type="submit" style={styles.btn} disabled={loading}>
            {loading ? '確認中...' : 'ログイン'}
          </button>
        </form>
      </div>
    </div>
  );
};

const styles = {
  bg: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #e8f4fd 0%, #f0f7f0 100%)',
    padding: '16px',
  },
  card: {
    background: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.10)',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '400px',
    textAlign: 'center',
  },
  logo: {
    fontSize: '48px',
    marginBottom: '8px',
  },
  title: {
    fontSize: '22px',
    fontWeight: '700',
    color: '#1a3a5c',
    margin: '0 0 4px',
  },
  subtitle: {
    fontSize: '15px',
    color: '#5a7a9a',
    margin: '0 0 32px',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    textAlign: 'left',
  },
  label: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#2c4a6e',
    marginTop: '8px',
  },
  input: {
    fontSize: '17px',
    padding: '12px 14px',
    borderRadius: '8px',
    border: '2px solid #c8d8e8',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  error: {
    color: '#c0392b',
    fontSize: '15px',
    background: '#fdf0ef',
    borderRadius: '6px',
    padding: '10px 14px',
    margin: '4px 0',
  },
  btn: {
    marginTop: '16px',
    padding: '14px',
    fontSize: '18px',
    fontWeight: '700',
    background: '#2563eb',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
};

export default LoginPage;
