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

// Parse numeric values, skip nulls/blanks
export const parseNumbers = (arr) =>
  arr.map((v) => parseFloat(v)).filter((v) => !isNaN(v));

export const average = (nums) =>
  nums.length === 0 ? 0 : nums.reduce((a, b) => a + b, 0) / nums.length;
