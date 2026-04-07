import Papa from "papaparse";

export function parseCSV(file) {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      dynamicTyping: false,
      complete: (results) => resolve(results),
      error: (err) => reject(err),
    });
  });
}

export function inferColumnType(col, rows) {
  const vals = rows.map((r) => r[col]).filter((v) => v !== "" && v != null);
  if (vals.length === 0) return "text";
  const nums = vals.filter((v) => !isNaN(parseFloat(v)) && v.toString().trim() !== "");
  if (nums.length / vals.length > 0.7) return "number";
  const uniq = [...new Set(vals)];
  if (uniq.length <= 20 && vals.length > 3) return "category";
  return "text";
}

export function getNumericCols(headers, rows) {
  return headers.filter((h) => inferColumnType(h, rows) === "number");
}

export function getCategoryCols(headers, rows) {
  return headers.filter((h) => inferColumnType(h, rows) === "category");
}

export function getColValues(col, rows) {
  return rows.map((r) => parseFloat(r[col])).filter((v) => !isNaN(v));
}

export function buildDataContext(data) {
  if (!data) return "No dataset loaded.";
  const { headers, rows } = data;
  const numCols = getNumericCols(headers, rows);
  const catCols = getCategoryCols(headers, rows);

  let ctx = `Dataset: ${rows.length} rows, ${headers.length} columns.\n`;
  ctx += `Columns: ${headers.join(", ")}\n`;
  ctx += `Numeric columns: ${numCols.join(", ") || "none"}\n`;
  ctx += `Category columns: ${catCols.join(", ") || "none"}\n`;

  // Add stats for numeric cols
  numCols.forEach((col) => {
    const vals = getColValues(col, rows);
    if (vals.length > 0) {
      const avg = (vals.reduce((a, b) => a + b, 0) / vals.length).toFixed(2);
      const min = Math.min(...vals).toFixed(2);
      const max = Math.max(...vals).toFixed(2);
      ctx += `${col}: min=${min}, max=${max}, avg=${avg}\n`;
    }
  });

  // Add category value counts
  catCols.forEach((col) => {
    const counts = {};
    rows.forEach((r) => { if (r[col]) counts[r[col]] = (counts[r[col]] || 0) + 1; });
    const top = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 5);
    ctx += `${col} top values: ${top.map(([k, v]) => `${k}(${v})`).join(", ")}\n`;
  });

  ctx += `\nFirst 5 rows sample:\n${JSON.stringify(rows.slice(0, 5), null, 2)}`;
  return ctx;
}
