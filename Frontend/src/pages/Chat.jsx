import React, { useState } from "react";
import { useChat } from "../context/ChatContext";
import { CheckCircle, Clock, Send, Database, Sparkles } from "lucide-react";

export const Chat = () => {
  const { messages, addMessage, activeConnection } = useChat();
  const [inputQuery, setInputQuery] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleSend = (e) => {
    e.preventDefault();
    if (!inputQuery.trim()) return;

    const userPrompt = inputQuery;
    setInputQuery("");
    addMessage({ sender: "USER", content: userPrompt });

    setIsGenerating(true);
    setTimeout(() => {
      addMessage({
        sender: "AI",
        content: `Extracted SQL query and results based on your prompt: "${userPrompt}"`,
        sqlQuery: `SELECT username, email, role, created_at FROM users WHERE role = 'ADMIN' ORDER BY id DESC LIMIT 5;`,
        queryResults: [
          { id: 1, username: "admin", email: "admin@aidatabaseassistant.com", role: "ADMIN", created_at: "2026-07-21" },
          { id: 2, username: "sarah_admin", email: "sarah@aidatabaseassistant.com", role: "ADMIN", created_at: "2026-07-20" },
        ],
        latency: "142 ms",
      });
      setIsGenerating(false);
    }, 800);
  };

  return (
    <div className="h-[calc(100vh-8.5rem)] flex flex-col bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl overflow-hidden shadow-2xs transition-colors">
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-slate-200/80 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Database size={20} />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white">Neural SQL Chat Console</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
              Target Catalog: <strong className="text-blue-600 dark:text-blue-400">{activeConnection?.name || "Internal MySQL DB"}</strong> ({activeConnection?.databaseName || "ai_db_assistant"})
            </p>
          </div>
        </div>
      </div>

      {/* Messages Feed */}
      <div className="flex-1 p-6 overflow-y-auto space-y-6">
        {messages.map((m) => (
          <div key={m.id}>
            {m.sender === "USER" ? (
              /* User Prompt Bubble */
              <div className="flex justify-end">
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-none px-5 py-3.5 max-w-[85%] 2xl:max-w-3xl text-sm sm:text-base font-semibold leading-relaxed shadow-md shadow-blue-500/20">
                  {m.content}
                </div>
              </div>
            ) : (
              /* AI Response Card Bubble */
              <div className="flex justify-start w-full">
                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl rounded-tl-none p-6 w-full text-sm sm:text-base leading-relaxed text-slate-900 dark:text-slate-100 space-y-5 shadow-2xs">
                  {/* Data Table */}
                  {m.queryResults && (
                    <div className="overflow-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-2xs max-h-72">
                      <table className="w-full text-left border-collapse text-sm">
                        <thead>
                          <tr className="bg-slate-100/90 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
                            {Object.keys(m.queryResults[0] || {}).map((col) => (
                              <th key={col} className="p-3.5 font-bold text-slate-800 dark:text-slate-200 font-mono capitalize text-sm">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                          {m.queryResults.map((row, i) => (
                            <tr key={i} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              {Object.values(row).map((val, j) => (
                                <td key={j} className="p-3.5 font-mono text-slate-700 dark:text-slate-300 text-sm">
                                  {String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Natural Language Explanation */}
                  <div className="text-slate-800 dark:text-slate-200 leading-relaxed text-sm sm:text-base font-medium whitespace-pre-line">
                    {m.content}
                  </div>

                  {/* Recommended SQL Code Block */}
                  {m.sqlQuery && (
                    <div className="border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 rounded-xl p-4 sm:p-5 space-y-2.5">
                      <div className="flex justify-between items-center text-xs font-bold text-blue-600 dark:text-blue-400">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle size={15} className="text-emerald-500" />
                          RECOMMENDED SQL QUERY
                        </span>
                      </div>
                      <pre className="text-sm font-mono text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-950 p-4 rounded-xl overflow-x-auto leading-relaxed border border-slate-200/60 dark:border-slate-800">
                        {m.sqlQuery}
                      </pre>
                    </div>
                  )}

                  {/* Response Latency Tag */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 font-mono pt-3 border-t border-slate-200 dark:border-slate-700 flex items-center gap-1.5 font-medium">
                    <Clock size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>AI Translation & Latency: <strong className="text-emerald-600 dark:text-emerald-400">{m.latency || "142 ms"}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-2xl text-sm font-semibold text-blue-600 dark:text-blue-400 flex items-center gap-2.5 animate-pulse border border-slate-200 dark:border-slate-700">
              <Sparkles size={18} />
              <span>Translating natural language prompt into optimized SQL...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Console */}
      <form onSubmit={handleSend} className="p-4 sm:p-5 border-t border-slate-200/80 dark:border-slate-800 bg-white dark:bg-slate-900 flex gap-3">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question in plain English e.g., 'Show top 5 customers by revenue in 2026'"
          className="flex-1 px-4 py-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-900 dark:text-white text-sm sm:text-base font-semibold placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
        />
        <button
          type="submit"
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-2xl text-sm font-bold flex items-center gap-2 shadow-md hover:from-blue-500 hover:to-indigo-500 transition-all cursor-pointer"
        >
          <Send size={16} />
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
};

export default Chat;
