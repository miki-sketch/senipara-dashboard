import { useState, useEffect } from 'react';
import { fetchSurveyData } from '../utils/sheets';
import { countBy, countMultiSelect, toChartData, parseNumbers, average } from '../utils/parse';

const CANONICAL_SONGS = [
  '「カレリア組曲」より「行進曲風に」',
  '詩的間奏曲',
  'バレエ音楽「白鳥の湖」より「情景」',
  '風紋',
  '笑点のテーマ',
  'トロンボナンザ',
  'フライ・ミー・トゥ・ザ・ムーン',
  'くるみ割り人形 in ポップス',
  'アンコール',
];

const SONG_RULES = [
  { keywords: ['ルパン', 'アンコール曲', 'アンコール'], canonical: 'アンコール' },
  { keywords: ['フライミー', 'フライ・ミー'], canonical: 'フライ・ミー・トゥ・ザ・ムーン' },
  { keywords: ['白鳥'], canonical: 'バレエ音楽「白鳥の湖」より「情景」' },
  { keywords: ['笑点'], canonical: '笑点のテーマ' },
  { keywords: ['くるみ'], canonical: 'くるみ割り人形 in ポップス' },
  { keywords: ['カレリア', '行進曲'], canonical: '「カレリア組曲」より「行進曲風に」' },
  { keywords: ['詩的', '間奏曲'], canonical: '詩的間奏曲' },
  { keywords: ['風紋'], canonical: '風紋' },
  { keywords: ['トロンボ'], canonical: 'トロンボナンザ' },
];

const normalizeQ6 = (text) => {
  const t = String(text).trim();
  for (const rule of SONG_RULES) {
    if (rule.keywords.some((kw) => t.includes(kw))) return rule.canonical;
  }
  return null;
};

export const useSurvey = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchSurveyData()
      .then(({ cols, rows }) => {
        // Columns: timestamp(0), Q1(1), Q2(2), Q3(3), Q4(4), Q5(5), Q6(6), Q7(7), Q8(8)
        const q1Key = cols[1];
        const q2Key = cols[2];
        const q3Key = cols[3];
        const q4Key = cols[4];
        const q5Key = cols[5];
        const q6Key = cols[6];
        const q7Key = cols[7];
        const q8Key = cols[8];

        const total = rows.length;

        // Q1: 年代
        const q1Counts = countBy(rows.map((r) => r[q1Key]));
        const q1Data = toChartData(q1Counts);

        // Q2: 来場経路（複数選択）
        const q2Counts = countMultiSelect(rows.map((r) => r[q2Key]));
        const q2Data = toChartData(q2Counts);

        // Q3: 来場回数（円グラフ）
        const q3Counts = countBy(rows.map((r) => r[q3Key]));
        const q3Data = toChartData(q3Counts);

        // Q4: 満足度（数字1〜5と文字ラベル両対応）
        const Q4_LABELS = ['不満足(1)', '物足りない(2)', '普通(3)', 'よかった(4)', '大満足(5)'];
        const Q4_TEXT_MAP = { '不満足': 1, '物足りない': 2, '普通': 3, 'よかった': 4, '大満足': 5 };
        const q4Nums = rows.map((r) => {
          const v = r[q4Key];
          if (v == null) return NaN;
          const n = parseFloat(v);
          if (!isNaN(n)) return n;
          return Q4_TEXT_MAP[String(v).trim()] ?? NaN;
        }).filter((v) => !isNaN(v));
        const q4Avg = average(q4Nums);
        const q4DistCounts = {};
        q4Nums.forEach((n) => { q4DistCounts[n] = (q4DistCounts[n] ?? 0) + 1; });
        const q4DistData = Q4_LABELS.map((label, i) => ({
          name: label,
          value: q4DistCounts[i + 1] ?? 0,
        }));

        // Q5 & Q6: 曲の人気ランキング（Q5:複数選択 + Q6:自由記述名寄せ）
        const q5Counts = countMultiSelect(rows.map((r) => r[q5Key]));
        const q6Normalized = {};
        const q6RowsByCanonical = {};
        const q6OtherList = [];
        rows.forEach((r) => {
          const v = r[q6Key];
          if (v == null || String(v).trim() === '') return;
          const canonical = normalizeQ6(v);
          if (canonical) {
            q6Normalized[canonical] = (q6Normalized[canonical] ?? 0) + 1;
            q6RowsByCanonical[canonical] = [...(q6RowsByCanonical[canonical] ?? []), r];
          } else {
            q6OtherList.push(String(v).trim());
          }
        });
        const songRankingRows = CANONICAL_SONGS.map((name) => ({
          name,
          q5Count: q5Counts[name] ?? 0,
          q6Count: q6Normalized[name] ?? 0,
          q6Rows: q6RowsByCanonical[name] ?? [],
        })).sort((a, b) => b.q5Count - a.q5Count || b.q6Count - a.q6Count);

        // Q7: 定演来場意向
        const q7Counts = countBy(rows.map((r) => r[q7Key]));
        const q7Data = toChartData(q7Counts);

        // Q8: 自由記述
        const q8List = rows
          .map((r) => r[q8Key])
          .filter((v) => v != null && String(v).trim() !== '');

        setStats({
          total,
          cols,
          q1: { label: q1Key, data: q1Data },
          q2: { label: q2Key, data: q2Data },
          q3: { label: q3Key, data: q3Data },
          q4: { label: q4Key, avg: q4Avg, dist: q4DistData, nums: q4Nums },
          songRanking: { rows: songRankingRows, otherList: q6OtherList },
          q7: { label: q7Key, data: q7Data },
          q8: { label: q8Key, list: q8List },
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { loading, error, stats };
};
