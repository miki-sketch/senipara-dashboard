// Count occurrences of each value in an array
export const countBy = (arr) => {
  const counts = {};
  arr.forEach((v) => {
    if (v == null || v === '') return;
    counts[v] = (counts[v] ?? 0) + 1;
  });
  return counts;
};

// Split a multi-select answer (comma-separated or semicolon-separated)
export const splitMulti = (v) => {
  if (v == null || v === '') return [];
  return String(v).split(/[,、，；;]\s*/).map((p) => p.trim()).filter(Boolean);
};

// Count multi-select answers
export const countMultiSelect = (arr) => {
  const counts = {};
  arr.forEach((v) => {
    splitMulti(v).forEach((key) => {
      counts[key] = (counts[key] ?? 0) + 1;
    });
  });
  return counts;
};

export const toChartData = (counts) =>
  Object.entries(counts)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'ja'))
    .map(([name, value]) => ({ name, value }));

// 固定の並び順（グラフの左から）。表記はデータの選択肢に合わせる
export const AGE_ORDER = ['10代以下', '20代', '30代', '40代', '50代', '60代', '70代以上'];
export const VISIT_ORDER = ['初めて', '2〜3回目', '4〜5回目', '6回以上'];

// order の順で並べる。order にない値は末尾（件数の多い順）
export const toOrderedChartData = (counts, order) => {
  const rank = (name) => {
    const i = order.indexOf(name);
    return i === -1 ? order.length : i;
  };
  return toChartData(counts).sort((a, b) => rank(a.name) - rank(b.name));
};

// Parse numeric values, skip nulls/blanks
export const parseNumbers = (arr) =>
  arr.map((v) => parseFloat(v)).filter((v) => !isNaN(v));

export const average = (nums) =>
  nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;
