const SPREADSHEET_ID = '1TRXdSmjZ17H1dvxYQ3OVPHIn1_lW-xpNabTyCTkD_VM';

const sheetUrl = (sheetName) =>
  `https://docs.google.com/spreadsheets/d/${SPREADSHEET_ID}/gviz/tq?tqx=out:json&sheet=${encodeURIComponent(sheetName)}`;

const parseGviz = (text) => {
  const json = text.match(/google\.visualization\.Query\.setResponse\(([\s\S]*)\)/);
  if (!json) throw new Error('Invalid gviz response');
  return JSON.parse(json[1]);
};

export const fetchSheet = async (sheetName) => {
  const res = await fetch(sheetUrl(sheetName));
  const text = await res.text();
  return parseGviz(text);
};

export const fetchCredentials = async () => {
  const data = await fetchSheet('SETTINGS');
  const rows = data.table.rows;
  // B3 = USER (row index 2, col index 1), B4 = PASS (row index 3, col index 1)
  const user = rows[2]?.c[1]?.v ?? '';
  const pass = rows[3]?.c[1]?.v ?? '';
  return { user: String(user), pass: String(pass) };
};

export const fetchSurveyData = async () => {
  const data = await fetchSheet('フォームの回答 2');
  const table = data.table;
  const cols = table.cols.map((c) => c.label);
  const rows = table.rows.map((r) => {
    const obj = {};
    r.c.forEach((cell, i) => {
      obj[cols[i]] = cell?.v ?? null;
    });
    return obj;
  });
  return { cols, rows };
};
