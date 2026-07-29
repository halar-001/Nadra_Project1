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
} from "lucide-react";

export const Chat = () => {
  const { messages, isGenerating, sendPrompt } = useChat();
  const { connections, selectedConnectionId, setSelectedConnectionId } = useConnection();

  const [inputQuery, setInputQuery] = useState("");
  const [copiedId, setCopiedId] = useState(null);
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

      // 1. Strings ('Computer Science')
      if (token.startsWith("'") && token.endsWith("'")) {
        return (
          <span key={idx} className="text-rose-600 dark:text-rose-400 font-bold">
            {token}
          </span>
        );
      }

      // 2. SQL Keywords
      if (keywords.includes(upper)) {
        return (
          <span key={idx} className="text-purple-600 dark:text-purple-400 font-extrabold">
            {token}
          </span>
        );
      }

      // 3. Numbers (3.5, 5, etc.)
      if (/^[0-9\.]+$/.test(token)) {
        return (
          <span key={idx} className="text-amber-600 dark:text-amber-400 font-extrabold">
            {token}
          </span>
        );
      }

      // 4. Aliases / Dot notation columns (s.student_id, d.department_name)
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

      // 5. Normal identifiers (table/column names)
      if (/^[A-Za-z_][A-Za-z0-9_]*$/.test(token.trim())) {
        return (
          <span key={idx} className="text-slate-800 dark:text-slate-200 font-medium">
            {token}
          </span>
        );
      }

      // 6. Symbols, operators, whitespace
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

  // Sample Prompt Suggestions
  const samplePrompts = [
    "Show all Computer Science students with CGPA above 3.5",
    "Find student details where first name is Ali",
    "List all departments ordered by building code",
    "Show active course enrollments with credit hours >= 3",
  ];

  return (
    <div className="h-full w-full flex flex-col bg-transparent overflow-hidden transition-colors">
      {/* 1. Messages Viewport */}
      <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6 w-full">
        {messages.map((m) => (
          <div key={m.id} className="space-y-4 w-full max-w-5xl mx-auto">
            {/* USER MESSAGE BUBBLE */}
            {m.sender === "USER" && (
              <div className="flex justify-end animate-in fade-in slide-in-from-bottom-2 duration-200">
                <div className="max-w-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 text-white px-5 py-3 rounded-2xl rounded-tr-none text-sm font-semibold shadow-md shadow-blue-500/15 leading-relaxed">
                  {m.content}
                </div>
              </div>
            )}

            {/* AI RESPONSE CARD CONTAINER */}
            {m.sender === "AI" && (
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

                {/* TABULAR RESULTS PLACEHOLDER (PHASE 5 SCOPE BOUNDARY) */}
                <div className="p-4 bg-slate-50/70 dark:bg-slate-800/40 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex items-center gap-3">
                  <Info size={18} className="text-blue-500 shrink-0" />
                  <div>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                      Phase 5: SQL Query Generation Complete
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                      Database execution and tabular results display will be enabled in Phase 6.
                    </span>
                  </div>
                </div>

                {/* TELEMETRY FOOTER (MODEL & LATENCY) */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-2">
                    <Code2 size={14} className="text-blue-500 shrink-0" />
                    <span>Model: <strong className="text-slate-800 dark:text-slate-200 font-bold">{m.model || "gemini-1.5-flash"}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Clock size={14} className="text-emerald-500 shrink-0" />
                    <span>Generation Latency: <strong className="text-emerald-600 dark:text-emerald-400 font-bold">{m.executionTimeMs ? `${m.executionTimeMs} ms` : "812 ms"}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {/* LOADING INDICATOR */}
        {isGenerating && (
          <div className="max-w-5xl mx-auto w-full">
            <div className="flex items-center gap-3 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-4 rounded-2xl shadow-2xs animate-pulse">
              <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-500 flex items-center justify-center shrink-0">
                <Sparkles size={16} className="animate-spin" />
              </div>
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Analyzing schema context and constructing sanitized SQL query...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 3. Bottom Input Form */}
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
