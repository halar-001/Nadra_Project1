import React, { useState } from "react";
import { useChat } from "../context/ChatContext";
import { Database, Plus, CheckCircle, Server, KeyRound } from "lucide-react";

export const Connections = () => {
  const { activeConnection, setActiveConnection } = useChat();
  const [connections, setConnections] = useState([
    { id: 1, name: "Internal MySQL DB", dbType: "MYSQL", host: "localhost", port: 3306, databaseName: "ai_db_assistant" },
    { id: 2, name: "Staging Analytics Postgres", dbType: "POSTGRESQL", host: "192.168.1.50", port: 5432, databaseName: "analytics_db" },
  ]);

  const [form, setForm] = useState({ name: "", dbType: "MYSQL", host: "localhost", port: 3306, databaseName: "" });

  const handleAdd = (e) => {
    e.preventDefault();
    if (!form.name || !form.databaseName) return;
    const newConn = { id: Date.now(), ...form };
    setConnections([...connections, newConn]);
    setForm({ name: "", dbType: "MYSQL", host: "localhost", port: 3306, databaseName: "" });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Database Connections</h1>
        <p className="text-sm text-slate-500 mt-1">Configure and manage secure database target catalogs for neural execution.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Existing Connections Grid */}
        <div className="lg:col-span-2 space-y-4">
          {connections.map((c) => {
            const isActive = activeConnection?.id === c.id;
            return (
              <div
                key={c.id}
                className={`glass-card p-6 border transition-all flex items-center justify-between ${
                  isActive ? "border-blue-500 shadow-md bg-white/80" : "hover:bg-white/70"
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-blue-50 border border-blue-100 text-blue-600 rounded-xl">
                    <Database size={22} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-600 border border-blue-200/80 uppercase tracking-widest">
                        {c.dbType}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 font-mono mt-1">
                      Host: <strong className="text-slate-700">{c.host}:{c.port}</strong> | Database: <strong className="text-blue-600">{c.databaseName}</strong>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setActiveConnection(c)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-emerald-500 text-white shadow-sm"
                      : "bg-slate-100 hover:bg-slate-200 text-slate-700"
                  }`}
                >
                  {isActive ? "Active Target" : "Select Target"}
                </button>
              </div>
            );
          })}
        </div>

        {/* Add Connection Glass Form */}
        <div className="glass-card p-6 space-y-5">
          <div className="flex items-center gap-2 border-b border-slate-200/60 pb-3">
            <Plus size={18} className="text-blue-600" />
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Add Connection</h2>
          </div>

          <form onSubmit={handleAdd} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Connection Label</label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                placeholder="Production MySQL"
                className="w-full px-3 py-2 glass-input text-xs text-slate-900"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Engine Type</label>
              <select
                value={form.dbType}
                onChange={(e) => setForm({ ...form, dbType: e.target.value })}
                className="w-full px-3 py-2 glass-input text-xs text-slate-900 bg-white/70"
              >
                <option value="MYSQL">MySQL</option>
                <option value="POSTGRESQL">PostgreSQL</option>
                <option value="SQLSERVER">SQL Server</option>
                <option value="ORACLE">Oracle</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Host</label>
                <input
                  type="text"
                  value={form.host}
                  onChange={(e) => setForm({ ...form, host: e.target.value })}
                  className="w-full px-3 py-2 glass-input text-xs text-slate-900"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Port</label>
                <input
                  type="number"
                  value={form.port}
                  onChange={(e) => setForm({ ...form, port: Number(e.target.value) })}
                  className="w-full px-3 py-2 glass-input text-xs text-slate-900"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Database Name</label>
              <input
                type="text"
                value={form.databaseName}
                onChange={(e) => setForm({ ...form, databaseName: e.target.value })}
                placeholder="ai_db_assistant"
                className="w-full px-3 py-2 glass-input text-xs text-slate-900"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 glass-button-primary font-bold text-xs cursor-pointer shadow-md mt-2"
            >
              Save Connection
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Connections;
