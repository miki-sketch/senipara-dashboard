import { useState, useEffect } from 'react';
import { fetchSurveyData, UnauthorizedError } from '../utils/sheets';
import { countBy, countMultiSelect, splitMulti, toChartData } from '../utils/parse';

const CANONICAL_SONGS = [
  'バレエ音楽「シルヴィア」より「バッカスの行列」',
  'オリエント急行',
  'バレエ音楽「白鳥の湖」より',
  '英雄の証「モンスターハンター」より',
  'MUSIC OF THE BEATLES',
  'ムーンライト・セレナーデ',
  'くるみ割り人形 in POPS',
  'マンテカ',
];

// キーワードは小文字で比較する
const SONG_RULES = [
  { keywords: ['シルヴィア', 'シルビア', 'バッカス'], canonical: 'バレエ音楽「シルヴィア」より「バッカスの行列」' },
  { keywords: ['オリエント'], canonical: 'オリエント急行' },
  { keywords: ['白鳥'], canonical: 'バレエ音楽「白鳥の湖」より' },
  { keywords: ['モンスターハンター', 'モンハン', '英雄の証'], canonical: '英雄の証「モンスターハンター」より' },
  { keywords: ['beatles', 'ビートルズ'], canonical: 'MUSIC OF THE BEATLES' },
  { keywords: ['ムーンライト', 'セレナーデ'], canonical: 'ムーンライト・セレナーデ' },
  { keywords: ['くるみ'], canonical: 'くるみ割り人形 in POPS' },
  { keywords: ['マンテカ'], canonical: 'マンテカ' },
];

const normalizeSong = (text) => {
  const t = String(text).trim().toLowerCase();
  for (const rule of SONG_RULES) {
    if (rule.keywords.some((kw) => t.includes(kw))) return rule.canonical;
  }
  return null;
};

// APIが返す列の位置
const COL = {
  q1: 1,        // 年代
  q2: 2,        // 認知経路（複数選択）
  referrer: 3,  // 紹介者
  q3: 4,        // 来場回数
  q4: 5,        // 印象に残った曲（複数選択）
  q5: 6,        // 一番印象に残った1曲（自由記述）
  name: 7,      // お名前
  region: 8,    // 地域
  q8: 9,        // ご感想・ご要望
};

const isBlank = (v) => v == null || String(v).trim() === '';

const Q2_MEMBER = '団員から直接';
const Q2_OTHER = 'その他';

export const computeStats = (rows) => {
  const total = rows.length;

  const q1Data = toChartData(countBy(rows.map((r) => r[COL.q1])));
  // 認知経路: グラフは「その他」以外。「その他」は記入内容を別に一覧表示
  const q2Counts = countMultiSelect(rows.map((r) => r[COL.q2]));
  const q2OtherCount = q2Counts[Q2_OTHER] ?? 0;
  delete q2Counts[Q2_OTHER];
  const q2Data = toChartData(q2Counts);
  const q3Data = toChartData(countBy(rows.map((r) => r[COL.q3])));
  const regionData = toChartData(countBy(rows.map((r) => (isBlank(r[COL.region]) ? null : String(r[COL.region]).trim()))));

  // 列3（紹介者欄）は列2の選択肢で振り分ける。両方選んだ方の記入はどちらにも載せる
  const referrerList = [];
  const q2OtherList = [];
  rows.forEach((r) => {
    if (isBlank(r[COL.referrer])) return;
    const text = String(r[COL.referrer]).trim();
    const choices = splitMulti(r[COL.q2]);
    if (choices.includes(Q2_MEMBER)) referrerList.push(text);
    if (choices.includes(Q2_OTHER)) q2OtherList.push(text);
  });

  // 曲の人気ランキング（Q4:複数選択 + Q5:自由記述名寄せ）
  const q4Counts = {};
  Object.entries(countMultiSelect(rows.map((r) => r[COL.q4]))).forEach(([name, count]) => {
    const canonical = normalizeSong(name);
    if (canonical) q4Counts[canonical] = (q4Counts[canonical] ?? 0) + count;
  });
  const q5Normalized = {};
  const q5RowsByCanonical = {};
  const q5OtherList = [];
  rows.forEach((r) => {
    const v = r[COL.q5];
    if (isBlank(v)) return;
    const canonical = normalizeSong(v);
    if (canonical) {
      q5Normalized[canonical] = (q5Normalized[canonical] ?? 0) + 1;
      q5RowsByCanonical[canonical] = [...(q5RowsByCanonical[canonical] ?? []), r];
    } else {
      q5OtherList.push(String(v).trim());
    }
  });
  const songRankingRows = CANONICAL_SONGS.map((name) => ({
    name,
    q4Count: q4Counts[name] ?? 0,
    q5Count: q5Normalized[name] ?? 0,
    q5Rows: q5RowsByCanonical[name] ?? [],
  })).sort((a, b) => b.q4Count - a.q4Count || b.q5Count - a.q5Count);

  // ご感想（お名前つき）
  const comments = rows
    .filter((r) => !isBlank(r[COL.q8]))
    .map((r) => ({
      text: String(r[COL.q8]),
      name: isBlank(r[COL.name]) ? '未記載' : String(r[COL.name]).trim(),
    }));

  return {
    total,
    keys: { q1: COL.q1, q2: COL.q2, q3: COL.q3 },
    q1: q1Data,
    q2: { data: q2Data, otherCount: q2OtherCount, otherList: q2OtherList },
    q3: q3Data,
    region: regionData,
    referrers: referrerList,
    songRanking: { rows: songRankingRows, otherList: q5OtherList },
    comments,
  };
};

// initialData: ログイン時に取得済みのデータ（あれば再取得しない）
export const useSurvey = (pw, initialData, onUnauthorized) => {
  const [loading, setLoading] = useState(!initialData);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(() => (initialData ? computeStats(initialData.rows) : null));

  useEffect(() => {
    if (initialData) return;
    fetchSurveyData(pw)
      .then(({ rows }) => setStats(computeStats(rows)))
      .catch((e) => {
        if (e instanceof UnauthorizedError) onUnauthorized?.();
        else setError(e.message);
      })
      .finally(() => setLoading(false));
  }, [pw, initialData, onUnauthorized]);

  return { loading, error, stats };
};
