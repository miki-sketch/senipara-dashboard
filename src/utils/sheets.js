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
  const cols = data.table.cols;

  // C1: DASHBOARD_USER  D1: value → row[0].c[3]
  // C2: DASHBOARD_PASS  D2: value → row[1].c[3]
  const rawUser = rows[0]?.c[3]?.v;
  const rawPass = rows[1]?.c[3]?.v;

  const user = rawUser != null ? String(rawUser).trim() : '';
  const pass = rawPass != null ? String(rawPass).trim() : '';
  return { user, pass };
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
