import React, { useState } from "react";
import { useChat } from "../context/ChatContext";
import { useConnection } from "../context/ConnectionContext";
import {
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Table as TableIcon,
  BarChart2,
  Download,
  FileSpreadsheet,
  FileText,
} from "lucide-react";

export const Chat = () => {
  const { messages, addMessage } = useChat();
  const { selectedConnectionId } = useConnection();

  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeView, setActiveView] = useState("table");

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userPrompt = inputQuery;
    const currentConnectionId = selectedConnectionId;

    setInputQuery("");
    addMessage({
      sender: "USER",
      content: userPrompt,
      connectionId: currentConnectionId,
    });

    setIsGenerating(true);

    setTimeout(() => {
      addMessage({
        sender: "AI",
        content: `Retrieves all student records matching prompt "${userPrompt}".`,
        sqlQuery: `SELECT * FROM students WHERE FirstName = 'Ali'`,
        queryResults: [
          { StudentID: 14, RegistrationNo: "2023-BSSE-014", FirstName: "Ali", LastName: "Sheikh", Gender: "Male", DateOfBirth: "2004-01-27", CNIC: "35147-3505969-6", Email: "ali.sheikh@example.com" },
          { StudentID: 22, RegistrationNo: "2023-BSDS-022", FirstName: "Ali", LastName: "Ahmed", Gender: "Male", DateOfBirth: "2001-11-18", CNIC: "35872-4339787-5", Email: "ali.ahmed@example.com" },
          { StudentID: 25, RegistrationNo: "2021-BSCS-025", FirstName: "Ali", LastName: "Sheikh", Gender: "Male", DateOfBirth: "2002-11-21", CNIC: "35622-7204716-2", Email: "ali.sheikh2@example.com" },
          { StudentID: 56, RegistrationNo: "2025-BSSE-056", FirstName: "Ali", LastName: "Ahmed", Gender: "Male", DateOfBirth: "2005-03-05", CNIC: "35208-4322151-4", Email: "ali.ahmed2@example.com" },
          { StudentID: 57, RegistrationNo: "2024-BSSE-057", FirstName: "Ali", LastName: "Qureshi", Gender: "Male", DateOfBirth: "2004-10-08", CNIC: "35430-6420599-5", Email: "ali.qureshi@example.com" },
          { StudentID: 77, RegistrationNo: "2023-BSCS-077", FirstName: "Ali", LastName: "Butt", Gender: "Male", DateOfBirth: "2001-10-17", CNIC: "35414-4502204-3", Email: "ali.butt@example.com" },
          { StudentID: 80, RegistrationNo: "2021-BSSE-080", FirstName: "Ali", LastName: "Siddiqui", Gender: "Male", DateOfBirth: "2001-08-04", CNIC: "35267-9533222-2", Email: "ali.siddiqui@example.com" },
          { StudentID: 84, RegistrationNo: "2024-BSAI-084", FirstName: "Ali", LastName: "Iqbal", Gender: "Male", DateOfBirth: "2004-12-02", CNIC: "35300-6958405-6", Email: "ali.iqbal@example.com" },
        ],
        latency: "28576 ms",
        summary: "Retrieves all student records where the first name is 'Ali'.",
      });
      setIsGenerating(false);
    }, 800);
  };

  const handleExport = (format, data) => {
    alert(`Exporting ${data.length} records as ${format.toUpperCase()}...`);
  };

  return (
    <div className="h-full w-full flex flex-col bg-transparent overflow-hidden transition-colors">
      
      {/* 1. Messages Viewport (Full-Bleed Canvas) */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 w-full">
        {messages.map((m) => (
          <div key={m.id} className="space-y-6 w-full max-w-7xl mx-auto">
            
            {/* USER MESSAGE BUBBLE */}
            {m.sender === "USER" && (
              <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="max-w-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-5 py-3 rounded-2xl rounded-tr-none text-sm font-medium shadow-md shadow-blue-500/15">
                  {m.content}
                </div>
              </div>
            )}

            {/* AI RESPONSE CARD CONTAINER */}
            {m.sender === "AI" && (
              <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800/90 rounded-3xl p-6 sm:p-8 shadow-md shadow-slate-200/30 dark:shadow-none space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
                
                {/* RECOMMENDED SQL QUERY HEADER */}
                {m.sqlQuery && (
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 font-extrabold text-[11px] tracking-wider uppercase shadow-2xs">
                      <CheckCircle2 size={15} />
                      <span>RECOMMENDED SQL QUERY</span>
                    </div>

                    <div className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-xs border border-slate-800 shadow-inner select-all leading-relaxed overflow-x-auto">
                      <code>{m.sqlQuery}</code>
                    </div>
                  </div>
                )}

                {/* TOOLBAR */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800/80 pb-4 pt-2">
                  
                  <div className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 p-1.5 rounded-xl shadow-inner">
                    <button
                      onClick={() => setActiveView("table")}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeView === "table"
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-600"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <TableIcon size={14} />
                      <span>Results Table</span>
                    </button>

                    <button
                      onClick={() => setActiveView("chart")}
                      className={`flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        activeView === "chart"
                          ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-xs border border-slate-200/80 dark:border-slate-600"
                          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                      }`}
                    >
                      <BarChart2 size={14} />
                      <span>Visual Chart</span>
                    </button>
                  </div>

                  {m.queryResults && (
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-slate-400 font-semibold mr-1 text-[11px]">Export Results:</span>
                      <button
                        onClick={() => handleExport("csv", m.queryResults)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                      >
                        <Download size={13} />
                        <span>CSV</span>
                      </button>
                      <button
                        onClick={() => handleExport("excel", m.queryResults)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                      >
                        <FileSpreadsheet size={13} />
                        <span>Excel</span>
                      </button>
                      <button
                        onClick={() => handleExport("pdf", m.queryResults)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-700 dark:text-slate-300 font-semibold text-[11px] hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-2xs hover:shadow-xs"
                      >
                        <FileText size={13} />
                        <span>PDF</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* RESULTS TABLE */}
                {activeView === "table" && m.queryResults && (
                  <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-slate-800 w-full shadow-2xs">
                    <table className="w-full text-left text-xs font-mono">
                      <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          {Object.keys(m.queryResults[0]).map((col) => (
                            <th key={col} className="p-3.5 uppercase text-[11px] tracking-wide">
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                        {m.queryResults.map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/50 transition-colors">
                            {Object.values(row).map((val, cellIdx) => (
                              <td key={cellIdx} className="p-3.5 text-slate-700 dark:text-slate-300 font-medium">
                                {String(val)}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {activeView === "chart" && m.queryResults && (
                  <div className="p-8 bg-slate-50/80 dark:bg-slate-800/40 border border-slate-200/80 dark:border-slate-800 rounded-2xl text-center space-y-3">
                    <BarChart2 size={36} className="mx-auto text-blue-600 dark:text-blue-400" />
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">Visual Telemetry Chart</h4>
                    <p className="text-xs text-slate-500 max-w-sm mx-auto">
                      Displaying distribution analytics for {m.queryResults.length} records.
                    </p>
                  </div>
                )}

                {/* SUMMARY & LATENCY FOOTER */}
                <div className="pt-2 space-y-3 border-t border-slate-100 dark:border-slate-800/80 text-xs">
                  <p className="text-slate-600 dark:text-slate-300 font-medium">
                    {m.summary || m.content}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-mono">
                    <Clock size={15} className="text-emerald-500 shrink-0" />
                    <span className="text-slate-500 dark:text-slate-400 font-medium">AI Translation & Latency:</span>
                    <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{m.latency || "28576 ms"}</strong>
                  </div>
                </div>

              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex items-center gap-3 text-slate-400 text-xs font-medium animate-pulse p-2 max-w-7xl mx-auto">
            <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
              <Sparkles size={16} className="animate-spin" />
            </div>
            <span>Translating prompt to SQL query and fetching target database records...</span>
          </div>
        )}
      </div>

      {/* 2. Bottom Pill Input Bar */}
      <form onSubmit={handleSend} className="p-4 sm:px-6 bg-transparent w-full shrink-0">
        <div className="relative flex items-center max-w-7xl mx-auto w-full">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            placeholder="e.g. Show top 5 users sorted by email"
            className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full py-4 pl-6 pr-16 text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-md shadow-slate-200/40 dark:shadow-none"
          />
          <button
            type="submit"
            disabled={!inputQuery.trim() || isGenerating}
            className={`absolute right-3 p-3 rounded-full transition-all cursor-pointer flex items-center justify-center shadow-md ${
              inputQuery.trim() && !isGenerating
                ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20 hover:scale-105"
                : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
            }`}
          >
            <Send size={15} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
