import { useState, useCallback } from 'react';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';

const PW_KEY = 'senipara-dashboard-pw';

const readPw = () => {
  try { return sessionStorage.getItem(PW_KEY); } catch { return null; }
};
const writePw = (pw) => {
  try {
    if (pw) sessionStorage.setItem(PW_KEY, pw);
    else sessionStorage.removeItem(PW_KEY);
  } catch { /* sessionStorage が使えない環境では保持しない */ }
};

function App() {
  const [pw, setPw] = useState(readPw);
  const [initialData, setInitialData] = useState(null);
  const [loginError, setLoginError] = useState('');

  const handleLogin = (newPw, data) => {
    writePw(newPw);
    setInitialData(data);
    setLoginError('');
    setPw(newPw);
  };

  const handleLogout = useCallback((message = '') => {
    writePw(null);
    setInitialData(null);
    setLoginError(message);
    setPw(null);
  }, []);

  // 保存済みパスワードが変更・無効化されていた場合
  const handleUnauthorized = useCallback(
    () => handleLogout('パスワードが変更された可能性があります。もう一度入力してください'),
    [handleLogout],
  );

  return pw
    ? <Dashboard pw={pw} initialData={initialData} onUnauthorized={handleUnauthorized} onLogout={() => handleLogout()} />
    : <LoginPage onLogin={handleLogin} initialError={loginError} />;
}

export default App;
