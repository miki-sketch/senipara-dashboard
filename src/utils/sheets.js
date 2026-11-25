export const API_URL =
  'https://script.google.com/macros/s/AKfycby7X1DqekKOu09LCRQ4svP2iqAdGy4o0ghXVWk4hLcaoyMoVafzMpGZ2I5JLXTytg1O/exec';

export class UnauthorizedError extends Error {
  constructor() {
    super('unauthorized');
    this.name = 'UnauthorizedError';
  }
}

const TIMEOUT_MS = 15000;
const MAX_RETRY = 1;

// GASウェブアプリから回答を取得する。1行目はヘッダー
// 1回15秒でタイムアウト。失敗時は1秒待って1回だけ再試行（パスワード違いは即エラー）
export const fetchSurveyData = async (pw) => {
  let lastErr;
  for (let attempt = 0; attempt <= MAX_RETRY; attempt++) {
    if (attempt > 0) await new Promise((r) => setTimeout(r, 1000));
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(`${API_URL}?pw=${encodeURIComponent(pw)}`, {
        signal: ctrl.signal,
        cache: 'no-store',
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      if (json.error === 'unauthorized') throw new UnauthorizedError();
      if (json.error) throw new Error(json.error);
      if (!Array.isArray(json.values)) throw new Error('Invalid API response');

      const [cols = [], ...rest] = json.values;
      const rows = rest.filter((r) => r.some((v) => v != null && String(v).trim() !== ''));
      return { cols, rows };
    } catch (err) {
      if (err instanceof UnauthorizedError) throw err;
      lastErr = err;
    } finally {
      clearTimeout(timer);
    }
  }
  throw lastErr;
};
