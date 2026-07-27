import React, { useState } from "react";
import { Plus, X, Eye, Settings, Trash2, RotateCw, CheckCircle2, AlertCircle, Database, Check } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import { useConnection } from "../context/ConnectionContext";

export const Connections = () => {
  const {
    connections,
    selectedConnectionId,
    setSelectedConnectionId,
    testConnection,
    addConnection,
    updateConnection,
    deleteConnection,
    isLoading,
  } = useConnection();

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    connectionName: "",
    databaseType: "MYSQL",
    host: "localhost",
    port: "3306",
    databaseName: "",
    username: "root",
    password: "",
  });

  // Test Connection State
  const [isTesting, setIsTesting] = useState(false);
  const [testSuccess, setTestSuccess] = useState(false);
  const [testError, setTestError] = useState("");
  const [isTestPassed, setIsTestPassed] = useState(false); // Controls Save Button disablement

  // Save State
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [refreshingId, setRefreshingId] = useState(null);

  // Reset Form
  const resetForm = () => {
    setFormData({
      connectionName: "",
      databaseType: "MYSQL",
      host: "localhost",
      port: "3306",
      databaseName: "",
      username: "root",
      password: "",
    });
    setIsTestPassed(false);
    setTestSuccess(false);
    setTestError("");
    setSaveError("");
    setEditingId(null);
    setShowAddForm(false);
  };

  // Handle Form Change (resets test validation state if credentials change)
  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setIsTestPassed(false); // Reset test verification when any field changes
    setTestSuccess(false);
    setTestError("");
  };

  // Handle Test Connection Click (POST /api/connections/test)
  const handleTestConnection = async () => {
    setTestError("");
    setTestSuccess(false);
    setSaveError("");

    if (!formData.host || !formData.port || !formData.databaseName || !formData.username) {
      setTestError("Host, Port, Database Name, and Username are required.");
      return;
    }

    setIsTesting(true);
    try {
      await testConnection(formData);
      setTestSuccess(true);
      setIsTestPassed(true); // Enables the Save Connection button!
    } catch (err) {
      setTestError(err.message || "Database connection test failed. Verify host, port, and credentials.");
      setIsTestPassed(false);
    } finally {
      setIsTesting(false);
    }
  };

  // Handle Save Connection Form Submission (POST /api/connections or PUT /api/connections/{id})
  const handleSaveSubmit = async (e) => {
    e.preventDefault();
    if (!isTestPassed) return; // Guard clause

    setIsSaving(true);
    setSaveError("");
    try {
      if (editingId) {
        await updateConnection(editingId, formData);
      } else {
        await addConnection(formData);
      }
      resetForm();
    } catch (err) {
      setSaveError(err.message || "Failed to save database connection.");
    } finally {
      setIsSaving(false);
    }
  };

  // Handle Edit Click
  const handleEditClick = (conn) => {
    setEditingId(conn.id);
    setFormData({
      connectionName: conn.connectionName || conn.name || "",
      databaseType: conn.databaseType || conn.type || "MYSQL",
      host: conn.host?.split(":")[0] || conn.host || "localhost",
      port: String(conn.port || conn.host?.split(":")[1] || 3306),
      databaseName: conn.databaseName || conn.dbName || "",
      username: conn.username || "root",
      password: "", // Never prefill password for security
    });
    setIsTestPassed(false);
    setShowAddForm(true);
  };

  // Handle Refresh Schema
  const handleRefreshSchema = (id) => {
    setRefreshingId(id);
    setTimeout(() => {
      setRefreshingId(null);
    }, 1000);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Database Catalogs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure external MySQL, PostgreSQL, and Oracle database connections securely.
          </p>
        </div>

        <Button
          variant={showAddForm ? "secondary" : "primary"}
          icon={showAddForm ? X : Plus}
          onClick={() => {
            if (showAddForm) {
              resetForm();
            } else {
              setShowAddForm(true);
            }
          }}
          className="rounded-xl px-5 py-2.5 shadow-md transition-all cursor-pointer font-bold text-xs"
        >
          {showAddForm ? "Close Form" : "Add Connection"}
        </Button>
      </div>

      {/* Main Grid: Catalogs List + Add/Edit Form Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all duration-300">
        {/* Catalogs List Section */}
        <div className={`${showAddForm ? "lg:col-span-7" : "lg:col-span-12"} space-y-4 transition-all duration-300`}>
          {connections.length === 0 ? (
            <Card glass={false} className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <Database size={36} className="mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">No Database Connections Found</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Add your external database credentials to start asking natural language SQL questions.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowAddForm(true)}
                className="mt-2 text-xs font-bold px-4 py-2 rounded-xl"
              >
                + Add First Connection
              </Button>
            </Card>
          ) : (
            <div className={`grid grid-cols-1 ${showAddForm ? "sm:grid-cols-1 xl:grid-cols-2" : "sm:grid-cols-2"} gap-6`}>
              {connections.map((cat) => {
                const isActive = Number(cat.id) === Number(selectedConnectionId);
                const displayName = cat.connectionName || cat.name || cat.databaseName;
                const dbType = (cat.databaseType || cat.type || "MYSQL").toUpperCase();
                const hostPort = cat.host?.includes(":") ? cat.host : `${cat.host || "localhost"}:${cat.port || 3306}`;
                const dbName = cat.databaseName || cat.dbName || "database";

                return (
                  <Card
                    key={cat.id}
                    glass={false}
                    className={`bg-white dark:bg-slate-900 border p-6 sm:p-7 rounded-3xl shadow-2xs flex flex-col justify-between transition-all ${
                      isActive
                        ? "border-blue-500/80 dark:border-blue-500/80 ring-2 ring-blue-500/20"
                        : "border-slate-200/80 dark:border-slate-800"
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800/60 rounded-md">
                            {dbType}
                          </span>
                          {isActive && (
                            <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md flex items-center gap-1">
                              <Check size={12} />
                              ACTIVE TARGET
                            </span>
                          )}
                        </div>

                        {/* Action Icons */}
                        <div className="flex items-center gap-1 text-slate-400">
                          <button
                            onClick={() => setSelectedConnectionId(cat.id)}
                            title={isActive ? "Active Catalog" : "Set Active Catalog"}
                            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                              isActive
                                ? "bg-blue-600 text-white"
                                : "bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700"
                            }`}
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => handleEditClick(cat)}
                            title="Configure Settings"
                            className="p-1.5 rounded-lg bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                          >
                            <Settings size={15} />
                          </button>
                          <button
                            onClick={() => deleteConnection(cat.id)}
                            title="Delete Connection"
                            className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {displayName}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        {hostPort}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>DB: {dbName}</span>
                      <button
                        onClick={() => handleRefreshSchema(cat.id)}
                        className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1.5 font-semibold cursor-pointer"
                      >
                        <RotateCw size={13} className={refreshingId === cat.id ? "animate-spin text-blue-600" : ""} />
                        <span>{refreshingId === cat.id ? "Refreshing..." : "Refresh Schema"}</span>
                      </button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Side: Add / Edit Database Connection Form Panel */}
        {showAddForm && (
          <Card
            glass={false}
            className="lg:col-span-5 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 p-6 sm:p-8 rounded-3xl shadow-2xs space-y-4 animate-in fade-in slide-in-from-right-4 duration-200"
          >
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
              <div>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  {editingId ? "Edit Connection" : "Add Connection"}
                </h3>
                <p className="text-[11px] text-slate-500 font-medium">
                  {editingId ? "Update database parameters" : "Test credentials before saving"}
                </p>
              </div>
              <button
                onClick={resetForm}
                className="text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Test & Save Status Alerts */}
            {testSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-xs font-bold flex items-center gap-2">
                <CheckCircle2 size={16} className="shrink-0" />
                <span>Connection test successful! Save is now enabled.</span>
              </div>
            )}

            {testError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{testError}</span>
              </div>
            )}

            {saveError && (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-medium flex items-center gap-2">
                <AlertCircle size={16} className="shrink-0" />
                <span>{saveError}</span>
              </div>
            )}

            <form onSubmit={handleSaveSubmit} className="space-y-3.5 text-xs">
              {/* DATABASE TYPE */}
              <div>
                <label className="block font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Database Engine
                </label>
                <select
                  value={formData.databaseType}
                  onChange={(e) => handleInputChange("databaseType", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl py-2.5 px-3 text-slate-900 dark:text-white font-medium focus:outline-none focus:border-blue-500"
                >
                  <option value="MYSQL">MySQL Server</option>
                  <option value="POSTGRESQL">PostgreSQL</option>
                  <option value="ORACLE">Oracle Database</option>
                </select>
              </div>

              {/* CONNECTION NAME */}
              <div>
                <label className="block font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Connection Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. University Database"
                  value={formData.connectionName}
                  onChange={(e) => handleInputChange("connectionName", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl py-2.5 px-3.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* HOST & PORT */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <label className="block font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Host / Server IP
                  </label>
                  <input
                    type="text"
                    placeholder="localhost"
                    value={formData.host}
                    onChange={(e) => handleInputChange("host", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl py-2.5 px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                    Port
                  </label>
                  <input
                    type="text"
                    placeholder="3306"
                    value={formData.port}
                    onChange={(e) => handleInputChange("port", e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl py-2.5 px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 font-mono"
                  />
                </div>
              </div>

              {/* DATABASE NAME */}
              <div>
                <label className="block font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Target Database Name
                </label>
                <input
                  type="text"
                  placeholder="e.g. StudentDB"
                  value={formData.databaseName}
                  onChange={(e) => handleInputChange("databaseName", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl py-2.5 px-3.5 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* USERNAME */}
              <div>
                <label className="block font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Database Username
                </label>
                <input
                  type="text"
                  placeholder="root"
                  value={formData.username}
                  onChange={(e) => handleInputChange("username", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl py-2.5 px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* PASSWORD */}
              <div>
                <label className="block font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1">
                  Database Password
                </label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={(e) => handleInputChange("password", e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl py-2.5 px-3.5 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={handleTestConnection}
                  disabled={isTesting}
                  className="px-4 py-2.5 rounded-xl border border-blue-200 dark:border-blue-800/80 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50 font-bold text-xs transition cursor-pointer flex items-center gap-1.5"
                >
                  {isTesting ? (
                    <div className="w-3.5 h-3.5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin" />
                  ) : null}
                  <span>{isTesting ? "Testing JDBC..." : "Test Connection"}</span>
                </button>

                <button
                  type="submit"
                  disabled={!isTestPassed || isSaving}
                  className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer ${
                    isTestPassed
                      ? "bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-blue-500/20"
                      : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
                  }`}
                  title={!isTestPassed ? "Test Connection must succeed before saving" : "Save Database Connection"}
                >
                  {isSaving ? (
                    <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  <span>{editingId ? "Update Connection" : "Save Connection"}</span>
                </button>
              </div>
            </form>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Connections;
