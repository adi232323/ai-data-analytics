import { useState } from "react";
import { BarChart2, MessageSquare } from "lucide-react";
import Sidebar from "./components/Sidebar";
import Dashboard from "./components/Dashboard";
import ChatPanel from "./components/ChatPanel";
import { parseCSV } from "./utils/csvParser";

export default function App() {
  const [data, setData] = useState(null);
  const [tab, setTab] = useState("dashboard");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleUpload = async (file) => {
    setLoading(true);
    setError(null);
    try {
      const result = await parseCSV(file);
      if (!result.meta.fields || result.meta.fields.length === 0) {
        throw new Error("Could not parse CSV headers. Please check your file.");
      }
      setData({
        fileName: file.name,
        headers: result.meta.fields,
        rows: result.data,
      });
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const tabs = [
    { id: "dashboard", label: "Dashboard", icon: BarChart2 },
    { id: "chat", label: "Chat with data", icon: MessageSquare },
  ];

  return (
    <div className="h-screen flex flex-col bg-white font-sans overflow-hidden">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-5 py-3 flex items-center gap-4 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
            <BarChart2 size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-gray-900">AI Data Analytics</h1>
            <p className="text-xs text-gray-400">CSV → Dashboard + AI Chat</p>
          </div>
        </div>

        {/* Tabs */}
        <nav className="ml-auto flex gap-1 bg-gray-100 rounded-xl p-1">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                tab === id
                  ? "bg-white text-blue-600 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon size={14} />
              {label}
            </button>
          ))}
        </nav>
      </header>

      {/* Body */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar data={data} onUpload={handleUpload} />

        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Upload loading / error bar */}
          {loading && (
            <div className="bg-blue-50 border-b border-blue-200 px-5 py-2 text-xs text-blue-700 flex items-center gap-2">
              <span className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></span>
              Parsing CSV file…
            </div>
          )}
          {error && (
            <div className="bg-red-50 border-b border-red-200 px-5 py-2 text-xs text-red-700">
              ⚠ {error}
            </div>
          )}
          {data && !loading && (
            <div className="bg-green-50 border-b border-green-200 px-5 py-2 text-xs text-green-700 flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              Loaded <strong>{data.fileName}</strong> — {data.rows.length} rows, {data.headers.length} columns
            </div>
          )}

          {tab === "dashboard" ? (
            <Dashboard data={data} />
          ) : (
            <ChatPanel data={data} />
          )}
        </main>
      </div>
    </div>
  );
}
