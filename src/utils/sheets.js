const API_URL =
  'https://script.google.com/macros/s/AKfycby7X1DqekKOu09LCRQ4svP2iqAdGy4o0ghXVWk4hLcaoyMoVafzMpGZ2I5JLXTytg1O/exec';

export class UnauthorizedError extends Error {
  constructor() {
    super('unauthorized');
    this.name = 'UnauthorizedError';
  }
}

// GASウェブアプリから回答を取得する。1行目はヘッダー
export const fetchSurveyData = async (pw) => {
  const res = await fetch(`${API_URL}?pw=${encodeURIComponent(pw)}`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const json = await res.json();
  if (json.error === 'unauthorized') throw new UnauthorizedError();
  if (json.error) throw new Error(json.error);
  if (!Array.isArray(json.values)) throw new Error('Invalid API response');

  const [cols = [], ...rest] = json.values;
  const rows = rest.filter((r) => r.some((v) => v != null && String(v).trim() !== ''));
  return { cols, rows };
};
