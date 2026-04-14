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
        // Columns: timestamp(0), Q1(1), Q2(2), Q3(3), Q4(4), Q5(5), Q6(6), Q7(7)
        const q1Key = cols[1];
        const q2Key = cols[2];
        const q3Key = cols[3];
        const q4Key = cols[4];
        const q5Key = cols[5];
        const q6Key = cols[6];
        const q7Key = cols[7];

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

        // Q4: 満足度
        const q4Nums = parseNumbers(rows.map((r) => r[q4Key]));
        const q4Avg = average(q4Nums);
        const q4DistCounts = countBy(q4Nums.map((n) => String(n)));
        const q4DistData = Object.entries(q4DistCounts)
          .sort((a, b) => parseFloat(a[0]) - parseFloat(b[0]))
          .map(([name, value]) => ({ name, value }));

        // Q5: 印象に残った曲（複数選択可）
        const q5Counts = countMultiSelect(rows.map((r) => r[q5Key]));
        const q5Data = toChartData(q5Counts).slice(0, 10);

        // Q6: 定演来場意向
        const q6Counts = countBy(rows.map((r) => r[q6Key]));
        const q6Data = toChartData(q6Counts);

        // Q7: 自由記述
        const q7List = rows
          .map((r) => r[q7Key])
          .filter((v) => v != null && String(v).trim() !== '');

        setStats({
          total,
          cols,
          q1: { label: q1Key, data: q1Data },
          q2: { label: q2Key, data: q2Data },
          q3: { label: q3Key, data: q3Data },
          q4: { label: q4Key, avg: q4Avg, dist: q4DistData, nums: q4Nums },
          q5: { label: q5Key, data: q5Data },
          q6: { label: q6Key, data: q6Data },
          q7: { label: q7Key, list: q7List },
        });
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { loading, error, stats };
};
