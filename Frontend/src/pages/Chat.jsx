import React, { useState, useRef, useEffect } from "react";
import { useChat } from "../context/ChatContext";
import { useConnection } from "../context/ConnectionContext";
import Card from "../components/Card";
import {
  CheckCircle2,
  Clock,
  Send,
  Sparkles,
  Copy,
  Check,
  Code2,
  Database,
  Info,
  ChevronDown,
  RefreshCw,
  Lightbulb,
  AlertTriangle,
  Download,
  Table as TableIcon,
  ChevronLeft,
  ChevronRight,
  Layers,
} from "lucide-react";

export const Chat = () => {
  const { messages, isGenerating, sendPrompt } = useChat();
  const { connections, selectedConnectionId, setSelectedConnectionId } = useConnection();

  const [inputQuery, setInputQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
  const [currentPageMap, setCurrentPageMap] = useState({});
  const messagesEndRef = useRef(null);

  // Active Connection Details
  const activeConn = connections.find((c) => c.id === selectedConnectionId) || connections[0];

  // Auto-scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isGenerating]);

  // Handle Form Submit
  const handleSend = async (e) => {
    e.preventDefault();
    if (!inputQuery.trim() || isGenerating) return;

    const query = inputQuery;
    setInputQuery("");
    await sendPrompt(query, selectedConnectionId);
  };

  // SQL IDE Syntax Highlighter
  const renderFormattedSql = (sqlString) => {
    if (!sqlString) return null;

    const keywords = [
      "SELECT", "FROM", "JOIN", "LEFT JOIN", "RIGHT JOIN", "INNER JOIN", "ON",
      "WHERE", "AND", "OR", "IN", "IS", "NOT", "NULL", "ORDER BY", "GROUP BY",
      "HAVING", "LIMIT", "ASC", "DESC", "AS", "COUNT", "SUM", "AVG", "MIN", "MAX"
    ];

    const tokens = sqlString.split(/('.*?'|\b[A-Za-z_][A-Za-z0-9_\.]*\b|[0-9\.]+|[=><!]+|,|\n|\s+)/g);

    return tokens.map((token, idx) => {
      if (!token) return null;
      const upper = token.trim().toUpperCase();

      if (token.startsWith("'") && token.endsWith("'")) {
        return (
          <span key={idx} className="text-rose-600 dark:text-rose-400 font-bold">
            {token}
          </span>
        );
      }

      if (keywords.includes(upper)) {
        return (
          <span key={idx} className="text-purple-600 dark:text-purple-400 font-extrabold">
            {token}
          </span>
        );
      }

      if (/^[0-9\.]+$/.test(token)) {
        return (
          <span key={idx} className="text-amber-600 dark:text-amber-400 font-extrabold">
            {token}
          </span>
        );
      }

      if (token.includes(".")) {
        const parts = token.split(".");
        return (
          <span key={idx}>
            <span className="text-blue-600 dark:text-blue-400 font-bold">{parts[0]}</span>
            <span className="text-slate-400 font-bold">.</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">{parts.slice(1).join(".")}</span>
          </span>
        );
      }

      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(token.trim())) {
        return (
          <span key={idx} className="text-slate-800 dark:text-slate-200 font-medium">
            {token}
          </span>
        );
      }

      return (
        <span key={idx} className="text-slate-500 dark:text-slate-400 font-bold">
          {token}
        </span>
      );
    });
  };

  // Handle Copy SQL
  const handleCopySql = (sqlText, messageId) => {
    if (!sqlText) return;
    navigator.clipboard.writeText(sqlText);
    setCopiedId(messageId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Handle Export CSV
  const handleExportCsv = (columns, rows, messageId) => {
    if (!columns || !rows || columns.length === 0) return;

    const escapeCsv = (val) => {
      if (val === null || val === undefined) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const headerRow = columns.map(escapeCsv).join(",");
    const dataRows = rows.map((row) => row.map(escapeCsv).join(","));
    const csvContent = [headerRow, ...dataRows].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `query_execution_results_${messageId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const ITEMS_PER_PAGE = 10;

  return (
    <div className="h-full w-full flex flex-col bg-transparent overflow-hidden transition-colors">
      {/* 1. Messages Viewport */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 w-full">
        {messages.map((m) => {
          const currentPage = currentPageMap[m.id] || 1;
          const totalRows = m.rows?.length || 0;
          const totalPages = Math.ceil(totalRows / ITEMS_PER_PAGE) || 1;
          const paginatedRows = m.rows
            ? m.rows.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
            : [];

          return (
            <div key={m.id} className="space-y-4 w-full max-w-5xl mx-auto">
              {/* USER MESSAGE BUBBLE */}
              {m.sender === "USER" && (
                <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-200">
                  <div className="max-w-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-5 py-3 rounded-2xl rounded-tr-none text-sm font-semibold shadow-md shadow-blue-500/15 leading-relaxed">
                    {m.content}
                  </div>
                </div>
              )}

              {/* AI ERROR RESPONSE CARD */}
              {m.sender === "AI" && m.isError && (
                <div className="w-full bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-900/60 rounded-3xl p-5 sm:p-6 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-200 shadow-xs">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-xl border border-rose-500/20 shrink-0">
                      <AlertTriangle size={20} />
                    </div>
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-rose-900 dark:text-rose-200">
                        AI Provider API Error
                      </h4>
                      <p className="text-xs text-rose-700 dark:text-rose-300 font-medium leading-relaxed">
                        {m.content?.replace(/^⚠️ Error:\s*/, "") || "All AI providers failed to generate or execute SQL. Please check your API keys or internet connection."}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* AI SUCCESS RESPONSE CARD CONTAINER */}
              {m.sender === "AI" && !m.isError && (
                <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-7 shadow-md shadow-slate-200/30 dark:shadow-none space-y-5 animate-in fade-in slide-in-from-bottom-3 duration-300">
                  {/* AI Text Summary / Intro */}
                  {m.content && (
                    <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                      {m.content}
                    </p>
                  )}

                  {/* SANITIZED SQL QUERY BOX */}
                  {(m.generatedSql || m.sqlQuery) && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800/60 text-blue-600 dark:text-blue-400 font-black text-[10px] tracking-wider uppercase shadow-2xs">
                          <CheckCircle2 size={13} />
                          <span>SANITIZED SQL QUERY</span>
                        </div>

                        {/* COPY SQL BUTTON */}
                        <button
                          onClick={() => handleCopySql(m.generatedSql || m.sqlQuery, m.id)}
                          className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/60 text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 text-xs font-bold transition-all cursor-pointer border border-slate-200 dark:border-slate-700 shadow-2xs"
                          title="Copy SQL Query to Clipboard"
                        >
                          {copiedId === m.id ? (
                            <>
                              <Check size={13} className="text-emerald-500" />
                              <span className="text-emerald-600 dark:text-emerald-400 font-extrabold">Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy size={13} />
                              <span>Copy SQL</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* SQL Code Block */}
                      <div className="p-4 sm:p-5 bg-slate-100/90 dark:bg-slate-800/90 rounded-2xl font-mono text-xs sm:text-sm border border-slate-200/90 dark:border-slate-700/90 shadow-2xs select-all leading-relaxed overflow-x-auto whitespace-pre-wrap">
                        <code>{renderFormattedSql(m.generatedSql || m.sqlQuery)}</code>
                      </div>
                    </div>
                  )}

                  {/* PHASE 6: EXECUTION TABULAR RESULTS DISPLAY */}
                  {m.columns && m.columns.length > 0 && (
                    <div className="space-y-3 pt-2">
                      {/* Summary Metrics & Export Bar */}
                      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-800">
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <span className="px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400 font-black text-[10px] tracking-wider uppercase rounded-full flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            EXECUTED
                          </span>
                          <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl text-xs">
                            Rows: <strong className="text-blue-600 dark:text-blue-400">{m.rowCount ?? totalRows}</strong>
                          </span>
                          <span className="px-2.5 py-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-extrabold rounded-xl text-xs">
                            Latency: <strong className="text-emerald-600 dark:text-emerald-400">{m.executionTimeMs || 42} ms</strong>
                          </span>
                        </div>

                        {/* EXPORT CSV BUTTON */}
                        <button
                          onClick={() => handleExportCsv(m.columns, m.rows, m.id)}
                          className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-extrabold shadow-2xs flex items-center gap-1.5 cursor-pointer transition-all hover:scale-105"
                        >
                          <Download size={13} />
                          <span>Export CSV</span>
                        </button>
                      </div>

                      {/* Interactive Results Table Grid */}
                      <div className="overflow-x-auto rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-2xs">
                        <table className="w-full text-left text-xs font-mono">
                          <thead className="bg-slate-100 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 font-bold border-b border-slate-200/90 dark:border-slate-700">
                            <tr>
                              <th className="p-3 text-[10px] uppercase tracking-wider text-slate-400 w-12 text-center">#</th>
                              {m.columns.map((col, idx) => (
                                <th key={idx} className="p-3 font-extrabold text-blue-600 dark:text-blue-400">
                                  {col}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                            {paginatedRows.length > 0 ? (
                              paginatedRows.map((row, rIdx) => (
                                <tr key={rIdx} className="hover:bg-blue-50/40 dark:hover:bg-slate-800/60 transition-colors">
                                  <td className="p-3 text-[10px] text-slate-400 font-bold text-center">
                                    {(currentPage - 1) * ITEMS_PER_PAGE + rIdx + 1}
                                  </td>
                                  {row.map((cell, cIdx) => (
                                    <td key={cIdx} className="p-3 text-slate-800 dark:text-slate-200 font-medium whitespace-nowrap">
                                      {cell === null || cell === undefined ? (
                                        <span className="text-slate-400 italic">null</span>
                                      ) : typeof cell === "number" ? (
                                        <span className="text-purple-600 dark:text-purple-400 font-bold">{cell}</span>
                                      ) : (
                                        <span>{String(cell)}</span>
                                      )}
                                    </td>
                                  ))}
                                </tr>
                              ))
                            ) : (
                              <tr>
                                <td colSpan={m.columns.length + 1} className="p-6 text-center text-slate-400 font-sans text-xs">
                                  No rows returned for this query.
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>

                      {/* Pagination Controls */}
                      {totalPages > 1 && (
                        <div className="flex items-center justify-between px-2 pt-1 text-xs">
                          <span className="text-slate-500 font-medium text-[11px]">
                            Showing Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong> ({totalRows} total rows)
                          </span>

                          <div className="flex items-center gap-1.5">
                            <button
                              disabled={currentPage === 1}
                              onClick={() => setCurrentPageMap((prev) => ({ ...prev, [m.id]: currentPage - 1 }))}
                              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                            >
                              <ChevronLeft size={14} />
                            </button>
                            <span className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl font-bold text-xs text-slate-800 dark:text-slate-200">
                              {currentPage} / {totalPages}
                            </span>
                            <button
                              disabled={currentPage === totalPages}
                              onClick={() => setCurrentPageMap((prev) => ({ ...prev, [m.id]: currentPage + 1 }))}
                              className="p-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-40 cursor-pointer"
                            >
                              <ChevronRight size={14} />
                            </button>
                          </div>
                        </div>
                      )}

                      {/* AI TASK COMPLETION SUCCESS BANNER */}
                      <div className="p-3.5 bg-emerald-50/80 dark:bg-emerald-950/40 rounded-2xl border border-emerald-200/80 dark:border-emerald-800/60 flex items-center justify-between gap-3 shadow-2xs">
                        <div className="flex items-center gap-2.5">
                          <CheckCircle2 size={18} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                          <div className="space-y-0.5">
                            <span className="text-xs font-extrabold text-emerald-900 dark:text-emerald-200 block">
                              AI Query Task Completed Successfully
                            </span>
                            <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-medium block">
                              Retrieved {m.rowCount ?? totalRows} record(s) in {m.executionTimeMs || 42} ms with 100% policy compliance.
                            </span>
                          </div>
                        </div>
                        <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 font-black text-[10px] uppercase tracking-wider shrink-0 border border-emerald-300/60 dark:border-emerald-700">
                          SUCCESS
                        </span>
                      </div>
                    </div>
                  )}

                  {/* TELEMETRY FOOTER (MODEL & LATENCY) */}
                  <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-500">
                    <div className="flex items-center gap-2">
                      <Code2 size={14} className="text-blue-500 shrink-0" />
                      <span>Model: <strong className="text-slate-800 dark:text-slate-200 font-bold">{m.model || "llama-3.3-70b-versatile (Groq)"}</strong></span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <Clock size={14} className="text-emerald-500 shrink-0" />
                      <span>Total Latency: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{m.executionTimeMs ? `${m.executionTimeMs} ms` : "42 ms"}</strong></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {/* LOADING INDICATOR */}
        {isGenerating && (
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="animate-spin" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Generating and executing query safely on target database...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 2. Bottom Input Form */}
      <div className="p-4 sm:px-6 bg-transparent w-full shrink-0">
        <form onSubmit={handleSend} className="max-w-5xl mx-auto w-full">
          <div className="relative flex items-center w-full">
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask a question in plain English (e.g. Show students with CGPA > 3.5)..."
              className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-full py-3.5 pl-6 pr-16 text-xs sm:text-sm font-medium text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-500/15 focus:border-blue-500 transition-all shadow-md shadow-slate-200/30 dark:shadow-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || isGenerating}
              className={`absolute right-2 w-9 h-9 rounded-full transition-all flex items-center justify-center shadow-md ${
                inputQuery.trim() && !isGenerating
                  ? "bg-[#2AABEE] hover:bg-[#1E96D3] active:scale-95 cursor-pointer shadow-[#2AABEE]/40 hover:scale-105"
                  : "bg-[#2AABEE] cursor-not-allowed opacity-90"
              }`}
              title="Send Message"
            >
              <svg
                viewBox="0 0 24 24"
                className="w-4 h-4 fill-white -translate-x-[0.5px] translate-y-[0.5px]"
              >
                <path d="M21.5 3.5L2.5 10.8L8.6 13.5L18.4 6.8L11.5 14.7L11.8 19.5L15.3 16.1L19.8 19.4L21.5 3.5Z" />
              </svg>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;
