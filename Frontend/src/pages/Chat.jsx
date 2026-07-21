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
    <div className="h-[calc(100vh-8.5rem)] flex flex-col glass-card border border-white/80 overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-slate-200/60 bg-white/40 backdrop-blur-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
            <Database size={18} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Neural SQL Chat Console</h2>
            <p className="text-[11px] text-slate-500 font-mono">
              Target Catalog: <strong className="text-blue-600">{activeConnection?.name || "Internal MySQL"}</strong> ({activeConnection?.databaseName || "ai_db_assistant"})
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
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 max-w-xl text-xs leading-relaxed shadow-md shadow-blue-500/20">
                  {m.content}
                </div>
              </div>
            ) : (
              /* AI Response Card Bubble */
              <div className="flex justify-start">
                <div className="glass-card rounded-2xl rounded-tl-none p-5 max-w-3xl text-xs leading-relaxed text-slate-800 space-y-4">
                  {/* Recommended SQL Code Block */}
                  {m.sqlQuery && (
                    <div className="border border-slate-200/60 bg-white/50 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between items-center text-[10px] font-bold text-blue-600">
                        <span className="flex items-center gap-1.5 uppercase tracking-wider">
                          <CheckCircle size={13} className="text-emerald-500" />
                          RECOMMENDED SQL QUERY
                        </span>
                      </div>
                      <pre className="text-[11px] font-mono text-slate-800 bg-slate-100/80 p-3 rounded-lg overflow-x-auto leading-normal">
                        {m.sqlQuery}
                      </pre>
                    </div>
                  )}

                  {/* Natural Language Explanation */}
                  <div className="text-slate-800 leading-relaxed text-[12px] whitespace-pre-line">
                    {m.content}
                  </div>

                  {/* Data Table inside Glass Container */}
                  {m.queryResults && (
                    <div className="overflow-auto rounded-xl border border-slate-200 bg-white shadow-xs max-h-64">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-slate-50/90 border-b border-slate-200 sticky top-0 z-10 backdrop-blur-sm">
                            {Object.keys(m.queryResults[0] || {}).map((col) => (
                              <th key={col} className="p-3 font-semibold text-slate-700 font-mono capitalize">
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {m.queryResults.map((row, i) => (
                            <tr key={i} className="border-b border-slate-100 hover:bg-slate-50">
                              {Object.values(row).map((val, j) => (
                                <td key={j} className="p-3 font-mono text-slate-600">
                                  {String(val)}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  {/* Response Latency Tag */}
                  <div className="text-[10px] text-slate-500 font-mono pt-2 border-t border-slate-200/60 flex items-center gap-1.5">
                    <Clock size={12} className="text-emerald-600 shrink-0" />
                    <span>AI Translation & Latency: <strong className="text-emerald-600">{m.latency || "142 ms"}</strong></span>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}

        {isGenerating && (
          <div className="flex justify-start">
            <div className="glass-card p-4 rounded-2xl text-xs text-blue-600 flex items-center gap-2 animate-pulse">
              <Sparkles size={16} />
              <span>Translating natural language prompt into optimized SQL...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Console */}
      <form onSubmit={handleSend} className="p-4 border-t border-slate-200/60 bg-white/50 backdrop-blur-md flex gap-3">
        <input
          type="text"
          value={inputQuery}
          onChange={(e) => setInputQuery(e.target.value)}
          placeholder="Ask a question in plain English e.g., 'Show top 5 customers by revenue in 2026'"
          className="flex-1 px-4 py-3 glass-input text-slate-900 text-xs font-medium"
        />
        <button
          type="submit"
          className="glass-button-primary px-6 py-3 text-xs font-bold flex items-center gap-2 cursor-pointer"
        >
          <Send size={14} />
          <span>Execute</span>
        </button>
      </form>
    </div>
  );
};

export default Chat;
