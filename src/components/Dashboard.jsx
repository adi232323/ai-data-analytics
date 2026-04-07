import MetricCard from "./MetricCard";
import { getNumericCols, getCategoryCols, getColValues } from "../utils/csvParser";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend,
} from "recharts";

const COLORS = ["#378ADD", "#1D9E75", "#D85A30", "#BA7517", "#D4537E", "#639922", "#7F77DD", "#888780"];

function EmptyState() {
  return (
    <div className="flex-1 flex items-center justify-center">
      <div className="text-center">
        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📊</span>
        </div>
        <h2 className="text-lg font-semibold text-gray-700 mb-1">No data yet</h2>
        <p className="text-sm text-gray-400 max-w-xs">
          Upload a CSV file from the sidebar to automatically generate your dashboard with charts and insights.
        </p>
      </div>
    </div>
  );
}

export default function Dashboard({ data }) {
  if (!data) return <EmptyState />;

  const { headers, rows } = data;
  const numCols = getNumericCols(headers, rows);
  const catCols = getCategoryCols(headers, rows);

  // Metric values
  const primaryVals = numCols[0] ? getColValues(numCols[0], rows) : [];
  const avg = primaryVals.length
    ? (primaryVals.reduce((a, b) => a + b, 0) / primaryVals.length).toFixed(2)
    : "—";
  const max = primaryVals.length ? Math.max(...primaryVals).toFixed(2) : "—";
  const min = primaryVals.length ? Math.min(...primaryVals).toFixed(2) : "—";

  // Bar chart – first 20 rows
  const barData = rows.slice(0, 20).map((r, i) => ({
    name: `#${i + 1}`,
    value: parseFloat(r[numCols[0]]) || 0,
  }));

  // Pie chart – category breakdown
  const pieCounts = {};
  if (catCols[0]) {
    rows.forEach((r) => {
      const v = r[catCols[0]];
      if (v) pieCounts[v] = (pieCounts[v] || 0) + 1;
    });
  }
  const pieData = Object.entries(pieCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([name, value]) => ({ name, value }));

  // Line chart – trend of first numeric col (up to 50 rows)
  const lineData = rows.slice(0, 50).map((r, i) => ({
    name: i + 1,
    value: parseFloat(r[numCols[0]]) || 0,
  }));

  // Second numeric col for comparison line
  const line2Data =
    numCols[1]
      ? rows.slice(0, 50).map((r, i) => ({
          name: i + 1,
          value: parseFloat(r[numCols[1]]) || 0,
        }))
      : null;

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
      <div className="max-w-6xl mx-auto flex flex-col gap-5">

        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold text-gray-800">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Auto-generated from <span className="font-medium text-gray-700">{data.fileName}</span>
          </p>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-4 gap-3">
          <MetricCard label="Total Rows" value={rows.length.toLocaleString()} color="blue" />
          <MetricCard label="Columns" value={headers.length} color="purple" />
          <MetricCard
            label={`Avg ${numCols[0] || "Value"}`}
            value={avg}
            sub={numCols[0] || ""}
            color="green"
          />
          <MetricCard
            label={`Max ${numCols[0] || "Value"}`}
            value={max}
            sub={`Min: ${min}`}
            color="orange"
          />
        </div>

        {/* Charts row */}
        <div className="grid grid-cols-2 gap-5">
          {/* Bar chart */}
          {numCols[0] && (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">{numCols[0]} — Bar Chart</h3>
              <p className="text-xs text-gray-400 mb-4">First 20 rows</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={barData} margin={{ top: 4, right: 4, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip
                    contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e5e7eb" }}
                  />
                  <Bar dataKey="value" fill="#378ADD" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Pie chart */}
          {pieData.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">{catCols[0]} — Breakdown</h3>
              <p className="text-xs text-gray-400 mb-4">{pieData.length} categories</p>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="value"
                    paddingAngle={2}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Legend
                    iconType="circle"
                    iconSize={8}
                    wrapperStyle={{ fontSize: 11 }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          ) : numCols[1] ? (
            <div className="bg-white rounded-xl border border-gray-200 p-5">
              <h3 className="text-sm font-semibold text-gray-700 mb-1">{numCols[1]} — Bar Chart</h3>
              <p className="text-xs text-gray-400 mb-4">First 20 rows</p>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart
                  data={rows.slice(0, 20).map((r, i) => ({ name: `#${i + 1}`, value: parseFloat(r[numCols[1]]) || 0 }))}
                  margin={{ top: 4, right: 4, left: -10, bottom: 0 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                  <Bar dataKey="value" fill="#1D9E75" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : null}
        </div>

        {/* Line chart */}
        {numCols[0] && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-700 mb-1">
              {numCols[0]}{numCols[1] ? ` vs ${numCols[1]}` : ""} — Trend
            </h3>
            <p className="text-xs text-gray-400 mb-4">First {lineData.length} rows</p>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={lineData} margin={{ top: 4, right: 16, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                {numCols[1] && <Legend wrapperStyle={{ fontSize: 11 }} />}
                <Line
                  type="monotone"
                  dataKey="value"
                  name={numCols[0]}
                  stroke="#185FA5"
                  strokeWidth={2}
                  dot={lineData.length <= 20}
                  activeDot={{ r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Data table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-x-auto">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Data Preview</h3>
              <p className="text-xs text-gray-400">First 10 rows of {rows.length.toLocaleString()} total</p>
            </div>
          </div>
          <table className="w-full text-xs border-collapse min-w-max">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left px-3 py-2 text-gray-400 font-medium w-10">#</th>
                {headers.map((h) => (
                  <th key={h} className="text-left px-3 py-2 text-gray-500 font-medium whitespace-nowrap">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.slice(0, 10).map((r, i) => (
                <tr key={i} className="hover:bg-gray-50 border-b border-gray-100 last:border-0">
                  <td className="px-3 py-2 text-gray-300 font-mono">{i + 1}</td>
                  {headers.map((h) => (
                    <td key={h} className="px-3 py-2 text-gray-700 whitespace-nowrap max-w-[180px] truncate">
                      {r[h]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
