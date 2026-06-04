import { useState, useEffect } from 'react';
import { fetchSurveyData } from '../utils/sheets';
import { countBy, countMultiSelect, toChartData, parseNumbers, average } from '../utils/parse';

export const useSurvey = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    fetchSurveyData()
      .then(({ cols, rows }) => {
        // Identify columns by position (Q1=col1, Q2=col2 ... depending on form structure)
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

        // Q5: 印象に残った曲（複数選択可）
        const q5Counts = countMultiSelect(rows.map((r) => r[q5Key]));
        const q5Data = toChartData(q5Counts).slice(0, 10);

        // Q6: 一番印象に残った1曲（自由記述形式）
        const q6List = rows
          .map((r) => r[q6Key])
          .filter((v) => v != null && String(v).trim() !== '');

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
          q5: { label: q5Key, data: q5Data },
          q6: { label: q6Key, list: q6List },
          q7: { label: q7Key, data: q7Data },
          q8: { label: q8Key, list: q8List },
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { loading, error, stats };
};
