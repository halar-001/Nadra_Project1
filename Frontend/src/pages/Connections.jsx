import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, X, Eye, Settings, Trash2, RotateCw, CheckCircle2, AlertCircle, Database, Check, UserCheck, Shield, FolderTree } from "lucide-react";
import Card from "../components/Card";
import Button from "../components/Button";
import { useConnection } from "../context/ConnectionContext";
import { useAuth } from "../context/AuthContext";
import { useSchema } from "../context/SchemaContext";

export const Connections = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { refreshSchema: schemaContextRefresh } = useSchema();
  const {
    connections,
    selectedConnectionId,
    setSelectedConnectionId,
    fetchAdminConnections,
    testConnection,
    addConnection,
    updateConnection,
    deleteConnection,
    isLoading,
  } = useConnection();

  const rawRole = user?.role || (Array.isArray(user?.roles) ? user?.roles[0] : user?.roles) || "VIEWER";
  const formattedRole = typeof rawRole === "string" ? rawRole.replace("ROLE_", "") : "VIEWER";
  const isAdmin = formattedRole.toUpperCase() === "ADMIN";

  const [viewMode, setViewMode] = useState("my"); // "my" or "admin"
  const [adminConnectionsList, setAdminConnectionsList] = useState([]);
  const [isAdminLoading, setIsAdminLoading] = useState(false);

  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [selectedDetailsConn, setSelectedDetailsConn] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);

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
      const res = await testConnection(formData);
      if (res && (res.success === false || res.data?.success === false)) {
        setTestError(res.message || res.data?.message || "JDBC Connection test failed. Check host, port, username, and password.");
        setTestSuccess(false);
        setIsTestPassed(false);
      } else {
        setTestSuccess(true);
        setIsTestPassed(true); // Enables the Save Connection button!
      }
    } catch (err) {
      setTestError(err.message || "Database connection test failed. Verify host, port, and credentials.");
      setTestSuccess(false);
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

  // Fetch admin connections if admin view mode is active
  useEffect(() => {
    if (viewMode === "admin" && isAdmin) {
      setIsAdminLoading(true);
      fetchAdminConnections()
        .then((list) => setAdminConnectionsList(list || []))
        .catch(() => setAdminConnectionsList(connections))
        .finally(() => setIsAdminLoading(false));
    }
  }, [viewMode, isAdmin, fetchAdminConnections, connections]);

  // Handle Refresh Schema
  const handleRefreshSchema = async (id) => {
    setRefreshingId(id);
    try {
      await schemaContextRefresh(id);
    } catch (e) {
      console.warn("Schema refresh notice:", e?.message);
    } finally {
      setRefreshingId(null);
    }
  };

  const displayedConnections = viewMode === "admin" && isAdmin ? adminConnectionsList : connections;

  return (
    <div className="space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Page Header & Admin Filter Tabs */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
            Database Catalogs
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Configure external MySQL database connections securely.
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Admin Mode Toggle Tabs */}
          {isAdmin && (
            <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700">
              <button
                onClick={() => setViewMode("my")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  viewMode === "my"
                    ? "bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                My Connections
              </button>
              <button
                onClick={() => setViewMode("admin")}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === "admin"
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-500 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <Shield size={13} />
                <span>All Connections (Admin)</span>
              </button>
            </div>
          )}

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
      </div>

      {/* Main Grid: Catalogs List + Add/Edit Form Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 transition-all duration-300">
        {/* Catalogs List Section */}
        <div className={`${showAddForm ? "lg:col-span-7" : "lg:col-span-12"} space-y-4 transition-all duration-300`}>
          {displayedConnections.length === 0 ? (
            <Card glass={false} className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl space-y-3">
              <Database size={36} className="mx-auto text-slate-400" />
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {viewMode === "admin" ? "No Connections Registered System-wide" : "No Database Connections Found"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {viewMode === "admin"
                  ? "No user database connections have been registered across the system yet."
                  : "Add your external database credentials to start asking natural language SQL questions."}
              </p>
              {viewMode !== "admin" && (
                <Button
                  variant="primary"
                  onClick={() => setShowAddForm(true)}
                  className="mt-2 text-xs font-bold px-4 py-2 rounded-xl"
                >
                  + Add First Connection
                </Button>
              )}
            </Card>
          ) : (
            <div className={`grid grid-cols-1 ${showAddForm ? "sm:grid-cols-1 xl:grid-cols-2" : "sm:grid-cols-2"} gap-6`}>
              {displayedConnections.map((cat) => {
                const isActive = Number(cat.id) === Number(selectedConnectionId);
                const displayName = cat.connectionName || cat.name || cat.databaseName;
                const dbType = (cat.databaseType || cat.type || "MYSQL").toUpperCase();
                const hostPort = cat.host?.includes(":") ? cat.host : `${cat.host || "localhost"}:${cat.port || 3306}`;
                const dbName = cat.databaseName || cat.dbName || "database";
                const ownerInfo = cat.userFullName || cat.userEmail || (cat.userId ? `User #${cat.userId}` : null);

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
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2.5 py-1 text-[10px] font-bold tracking-wider uppercase text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 border border-blue-200/60 dark:border-blue-800/60 rounded-md">
                            {dbType}
                          </span>
                          {isActive && (
                            <span className="px-2.5 py-0.5 text-[10px] font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 rounded-md flex items-center gap-1">
                              <Check size={12} />
                              ACTIVE TARGET
                            </span>
                          )}
                          {viewMode === "admin" && ownerInfo && (
                            <span className="px-2.5 py-0.5 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 rounded-md flex items-center gap-1">
                              <UserCheck size={11} />
                              Owner: {ownerInfo}
                            </span>
                          )}
                        </div>

                        {/* Action Icons: In Admin Mode show ONLY View Details; in Personal Mode show Set Active, Edit, Delete */}
                        <div className="flex items-center gap-1 text-slate-400">
                          {viewMode === "admin" ? (
                            <button
                              onClick={() => setSelectedDetailsConn(cat)}
                              title="View Connection & User Details"
                              className="px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/80 transition-all font-bold text-xs flex items-center gap-1.5 cursor-pointer border border-blue-200/80 dark:border-blue-800/80 shadow-2xs"
                            >
                              <Eye size={14} />
                              <span>View Details</span>
                            </button>
                          ) : (
                            <>
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
                                onClick={() => setDeleteConfirmId(cat.id)}
                                title="Delete Connection"
                                className="p-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/50 text-rose-400 hover:text-rose-600 dark:hover:text-rose-300 transition-colors cursor-pointer"
                              >
                                <Trash2 size={15} />
                              </button>
                            </>
                          )}
                        </div>
                      </div>

                      <h3 className="text-xl font-black text-slate-900 dark:text-white">
                        {displayName}
                      </h3>
                      <p className="text-xs font-mono text-slate-400 mt-1">
                        {hostPort}
                      </p>
                    </div>

                    <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 font-mono">
                      <span>DB: {dbName}</span>
                      {viewMode !== "admin" && (
                        <div className="flex items-center gap-3 font-sans font-bold">
                          <button
                            onClick={() => {
                              setSelectedConnectionId(cat.id);
                              navigate(`/schema?connectionId=${cat.id}`);
                            }}
                            className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 cursor-pointer"
                            title="Inspect Database Schema & Tables"
                          >
                            <FolderTree size={13} />
                            <span>Inspect Schema</span>
                          </button>
                          <button
                            onClick={() => handleRefreshSchema(cat.id)}
                            className="text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 cursor-pointer"
                          >
                            <RotateCw size={13} className={refreshingId === cat.id ? "animate-spin text-blue-600" : ""} />
                            <span>{refreshingId === cat.id ? "Refreshing..." : "Refresh"}</span>
                          </button>
                        </div>
                      )}
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

      {/* Admin View Details Modal */}
      {selectedDetailsConn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in zoom-in-95 duration-150 relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Shield className="text-blue-600 dark:text-blue-400" size={20} />
                <h3 className="text-lg font-black text-slate-900 dark:text-white">
                  Connection & Owner Details
                </h3>
              </div>
              <button
                onClick={() => setSelectedDetailsConn(null)}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* User Owner Info */}
            <div className="bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-900/40 p-4 rounded-2xl space-y-2">
              <p className="text-xs font-black text-amber-700 dark:text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
                <UserCheck size={14} />
                Registered Owner Information
              </p>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Owner Name</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100">
                    {selectedDetailsConn.userFullName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Owner Email</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                    {selectedDetailsConn.userEmail || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">User ID</span>
                  <span className="font-bold text-slate-900 dark:text-slate-100 font-mono">
                    #{selectedDetailsConn.userId || selectedDetailsConn.id}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase">Role</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">
                    {(
                      selectedDetailsConn.userRole ||
                      selectedDetailsConn.role ||
                      (selectedDetailsConn.userEmail === user?.email ? formattedRole : "USER")
                    ).replace("ROLE_", "")}
                  </span>
                </div>
              </div>
            </div>

            {/* Database Technical Parameters */}
            <div className="space-y-3">
              <p className="text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Database size={14} className="text-blue-500" />
                Database Engine Parameters
              </p>
              <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 dark:bg-slate-800/50 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 font-mono">
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase font-sans">Connection Name</span>
                  <span className="font-extrabold text-slate-900 dark:text-white font-sans text-sm">
                    {selectedDetailsConn.connectionName || selectedDetailsConn.name || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase font-sans">Engine Type</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400 uppercase font-sans">
                    {selectedDetailsConn.databaseType || "MYSQL"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase font-sans">Host / Server IP</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedDetailsConn.host || "localhost"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase font-sans">Port</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedDetailsConn.port || 3306}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase font-sans">Database Name</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedDetailsConn.databaseName || "N/A"}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px] font-bold uppercase font-sans">Username</span>
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {selectedDetailsConn.username || "N/A"}
                  </span>
                </div>
                <div className="col-span-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
                  <span className="text-slate-400 text-[10px] font-bold uppercase font-sans">Password Security</span>
                  <span className="px-2 py-0.5 text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-md">
                    •••••••• (Encrypted in DB)
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <Button
                variant="secondary"
                onClick={() => setSelectedDetailsConn(null)}
                className="px-5 py-2 text-xs font-bold rounded-xl cursor-pointer"
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl p-6 w-full max-w-sm flex flex-col gap-5 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="h-12 w-12 rounded-full bg-rose-100 dark:bg-rose-900/30 flex items-center justify-center text-rose-600 dark:text-rose-400">
                <Trash2 size={24} />
              </div>
              <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">Delete Connection?</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 font-medium leading-relaxed">
                Are you sure you want to delete this database connection? This action is permanent and will also delete any associated chat sessions.
              </p>
            </div>
            <div className="flex gap-3 mt-2">
              <Button
                variant="secondary"
                onClick={() => setDeleteConfirmId(null)}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer"
              >
                Cancel
              </Button>
              <button
                onClick={() => {
                  deleteConnection(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold cursor-pointer bg-rose-500 hover:bg-rose-600 text-white transition-all shadow-md shadow-rose-500/20"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Connections;
