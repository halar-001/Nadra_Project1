import React, { useState } from "react";
import { Plus, X, Eye, Settings, Trash2, RotateCw, CheckCircle2, Server } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import Input from "../components/Input";
import { useChat } from "../context/ChatContext";

export const Connections = () => {
  const { setActiveConnection } = useChat();
  const [showAddForm, setShowAddForm] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [refreshingId, setRefreshingId] = useState(null);

  const [catalogs, setCatalogs] = useState([
    { id: 1, name: "HalarDB", host: "localhost:3306", dbName: "StudentDB", type: "MYSQL" },
    { id: 2, name: "StudentDB", host: "localhost:3306", dbName: "StudentDB", type: "MYSQL" },
  ]);

  const [formData, setFormData] = useState({
    type: "MYSQL",
    name: "",
    host: "localhost",
    port: "3306",
    databaseName: "",
    username: "root",
    password: "",
  });

  const handleTest = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      setTestSuccess(true);
      setTimeout(() => setTestSuccess(false), 2500);
    }, 800);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newCatalog = {
      id: Date.now(),
      name: formData.name || `${formData.databaseName || "Database"}`,
      host: `${formData.host}:${formData.port}`,
      dbName: formData.databaseName || "ai_db_assistant",
      type: formData.type.toUpperCase(),
    };
    setCatalogs([...catalogs, newCatalog]);
    setActiveConnection(newCatalog);
    setShowAddForm(false);
    setFormData({
      type: "MYSQL",
      name: "",
      host: "localhost",
      port: "3306",
      databaseName: "",
      username: "root",
      password: "",
    });
  };

  const handleDelete = (id) => {
    setCatalogs(catalogs.filter((c) => c.id !== id));
  };

  const handleRefreshSchema = (id) => {
    setRefreshingId(id);
    setTimeout(() => {
      setRefreshingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Database Catalogs
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure credentials and query targets
          </p>
        </div>

        <Button
          variant={showAddForm ? "secondary" : "primary"}
          icon={showAddForm ? X : Plus}
          onClick={() => setShowAddForm(!showAddForm)}
          className="rounded-xl px-5 py-2.5 shadow-md transition-all cursor-pointer font-bold text-xs"
        >
          {showAddForm ? "Close Form" : "Add Connection"}
        </Button>
      </div>

      {/* Main Grid: Catalogs List + Add Form Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all duration-300">
        {/* Catalogs Section */}
        <div className={`${showAddForm ? "lg:col-span-7" : "lg:col-span-12"} space-y-4 transition-all duration-300`}>
          <div className={`grid grid-cols-1 ${showAddForm ? "sm:grid-cols-1 xl:grid-cols-2" : "sm:grid-cols-2"} gap-6`}>
            {catalogs.map((cat) => (
              <Card
                key={cat.id}
                glass={false}
                className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-7 rounded-3xl shadow-2xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800/60 rounded-md">
                      {cat.type}
                    </span>

                    {/* Action Icons */}
                    <div className="flex items-center gap-2 text-slate-400">
                      <button
                        onClick={() => setActiveConnection(cat)}
                        title="Set Active Catalog"
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Eye size={15} />
                      </button>
                      <button
                        title="Configure Settings"
                        className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800/80 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                      >
                        <Settings size={15} />
                      </button>
                      <button
                        onClick={() => handleDelete(cat.id)}
                        title="Delete Connection"
                        className="p-1.5 rounded-lg bg-red-50 dark:bg-red-950/50 text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors cursor-pointer"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </div>

                  <h3 className="text-xl font-black text-slate-900 dark:text-white">
                    {cat.name}
                  </h3>
                  <p className="text-xs font-mono text-slate-400 mt-1">
                    {cat.host}
                  </p>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                  <span>DB: {cat.dbName}</span>
                  <button
                    onClick={() => handleRefreshSchema(cat.id)}
                    className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 font-semibold cursor-pointer"
                  >
                    <RotateCw size={13} className={refreshingId === cat.id ? "animate-spin text-blue-600" : ""} />
                    <span>{refreshingId === cat.id ? "Refreshing..." : "Refresh Schema"}</span>
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Right Side: Add Database Connection Form Panel */}
        {showAddForm && (
          <Card
            glass={false}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xs space-y-4 animate-in fade-in slide-in-from-right-4 duration-200"
          >
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                Add Database Connection
              </h3>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              {/* DATABASE TYPE */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Database Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3 text-slate-800 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                >
                  <option value="MYSQL">MySQL Server</option>
                  <option value="POSTGRES">PostgreSQL</option>
                  <option value="ORACLE">Oracle Database</option>
                </select>
              </div>

              {/* DISPLAY NAME */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Display Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. Production MySQL"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* HOST & PORT */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Host
                  </label>
                  <input
                    type="text"
                    value={formData.host}
                    onChange={(e) => setFormData({ ...formData, host: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <div>
                  <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    value={formData.port}
                    onChange={(e) => setFormData({ ...formData, port: e.target.value })}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
              </div>

              {/* DATABASE NAME */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Database Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. customer_db"
                  value={formData.databaseName}
                  onChange={(e) => setFormData({ ...formData, databaseName: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* USERNAME */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Username
                </label>
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl py-2.5 px-3.5 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                />
              </div>

              {testSuccess && (
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 text-center animate-in fade-in flex items-center justify-center gap-1">
                  <CheckCircle2 size={14} />
                  <span>Connection test successful!</span>
                </p>
              )}

              {/* Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  isLoading={isTesting}
                  onClick={handleTest}
                  className="rounded-xl px-5 py-2.5 text-xs"
                >
                  Test Connection
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  className="rounded-xl px-5 py-2.5 text-xs"
                >
                  Save Connection
                </Button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Connections;
