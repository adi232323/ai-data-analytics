import { useRef } from "react";
import { Upload, FileText, Hash, Tag, AlignLeft } from "lucide-react";
import { inferColumnType } from "../utils/csvParser";

const typeIcon = {
  number: <Hash size={10} />,
  category: <Tag size={10} />,
  text: <AlignLeft size={10} />,
};

const typeColor = {
  number: "bg-blue-100 text-blue-600",
  category: "bg-purple-100 text-purple-600",
  text: "bg-gray-100 text-gray-500",
};

export default function Sidebar({ data, onUpload }) {
  const inputRef = useRef();

  const handleFile = (e) => {
    if (e.target.files[0]) onUpload(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.name.endsWith(".csv")) onUpload(file);
  };

  return (
    <div className="w-64 bg-white border-r border-gray-200 flex flex-col overflow-hidden">
      <div className="p-4 flex flex-col gap-4 overflow-y-auto flex-1">
        {/* Upload section */}
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
            Data Source
          </p>
          <div
            onClick={() => inputRef.current.click()}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group"
          >
            <div className="w-10 h-10 bg-gray-100 group-hover:bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2 transition-colors">
              <Upload size={18} className="text-gray-400 group-hover:text-blue-500" />
            </div>
            <p className="text-xs font-medium text-gray-600 group-hover:text-blue-600">
              {data ? "Upload new CSV" : "Click or drag CSV here"}
            </p>
            <p className="text-xs text-gray-400 mt-1">Supports any .csv file</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFile}
            />
          </div>
        </div>

        {/* File info */}
        {data && (
          <>
            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Loaded File
              </p>
              <div className="flex items-center gap-2 bg-green-50 border border-green-100 rounded-lg px-3 py-2">
                <FileText size={14} className="text-green-600 flex-shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-medium text-green-800 truncate">{data.fileName}</p>
                  <p className="text-xs text-green-600">
                    {data.rows.length} rows · {data.headers.length} cols
                  </p>
                </div>
              </div>
            </div>

            <div>
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                Columns
              </p>
              <div className="flex flex-col gap-1.5">
                {data.headers.map((h) => {
                  const type = inferColumnType(h, data.rows);
                  return (
                    <div
                      key={h}
                      className="flex items-center justify-between gap-2 bg-gray-50 rounded-lg px-2.5 py-1.5"
                    >
                      <span className="text-xs text-gray-700 truncate flex-1">{h}</span>
                      <span
                        className={`flex items-center gap-1 text-[10px] font-medium px-1.5 py-0.5 rounded ${typeColor[type]}`}
                      >
                        {typeIcon[type]}
                        {type}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {!data && (
          <div className="text-center py-4">
            <p className="text-xs text-gray-400">No file loaded yet</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="border-t border-gray-100 px-4 py-3">
        <p className="text-xs text-gray-400 text-center">AI Data Analytics v1.0</p>
      </div>
    </div>
  );
}
