import React, { useState, useEffect, useMemo, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Card from "../components/Card";
import { useConnection } from "../context/ConnectionContext";
import { useSchema } from "../context/SchemaContext";
import {
  Database,
  Table as TableIcon,
  Search,
  RotateCw,
  Key,
  Link2,
  Zap,
  ChevronRight,
  ChevronDown,
  Check,
  Layers,
  FileCode2,
} from "lucide-react";

export const SchemaExplorer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const connParam = searchParams.get("connectionId");

  const { connections, selectedConnectionId, setSelectedConnectionId } = useConnection();
  const { schemaMap, fetchSchema, isRefreshing, refreshSchema } = useSchema();

  // Active Connection ID
  const currentConnId = connParam ? Number(connParam) : selectedConnectionId;
  const currentSchema = schemaMap[currentConnId] || null;

  // UI States
  const [selectedTableName, setSelectedTableName] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("columns"); // "columns" | "relationships" | "json"
  const [isDbDropdownOpen, setIsDbDropdownOpen] = useState(false);
  const dbMenuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dbMenuRef.current && !dbMenuRef.current.contains(event.target)) {
        setIsDbDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Sync and fetch schema when currentConnId changes
  useEffect(() => {
    if (currentConnId) {
      fetchSchema(currentConnId);
      setSelectedTableName(null);
    }
  }, [currentConnId]);

  // Handle Dropdown Selection Change
  const handleConnectionChange = (newId) => {
    const id = Number(newId);
    setSelectedConnectionId(id);
    setSearchParams({ connectionId: id });
    setSelectedTableName(null);
    fetchSchema(id);
  };

  // Filtered Tables
  const filteredTables = useMemo(() => {
    if (!currentSchema || !currentSchema.tables) return [];
    if (!searchTerm.trim()) return currentSchema.tables;
    const term = searchTerm.toLowerCase();

    return currentSchema.tables.filter((tbl) => {
      const matchTable = tbl.tableName.toLowerCase().includes(term);
      const matchColumn = tbl.columns?.some((col) => col.columnName.toLowerCase().includes(term));
      return matchTable || matchColumn;
    });
  }, [currentSchema, searchTerm]);

  // Active Table
  const activeTable = useMemo(() => {
    if (!currentSchema || !currentSchema.tables || currentSchema.tables.length === 0) return null;
    if (selectedTableName) {
      const found = currentSchema.tables.find((t) => t.tableName === selectedTableName);
      if (found) return found;
    }
    return filteredTables[0] || currentSchema.tables[0];
  }, [currentSchema, selectedTableName, filteredTables]);

  // Handle Manual Refresh
  const handleRefresh = async () => {
    if (currentConnId) {
      await refreshSchema(currentConnId);
    }
  };

  // Helper for Data Type Badges
  const getDataTypeBadgeClass = (dataType) => {
    const type = (dataType || "").toUpperCase();
    if (type.includes("INT") || type.includes("DECIMAL") || type.includes("FLOAT") || type.includes("NUMBER")) {
      return "bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border-purple-200 dark:border-purple-800";
    }
    if (type.includes("CHAR") || type.includes("TEXT") || type.includes("STRING")) {
      return "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800";
    }
    if (type.includes("DATE") || type.includes("TIME")) {
      return "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800";
    }
    if (type.includes("BOOL")) {
      return "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800";
    }
    return "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700";
  };

  return (
    <div className="w-full space-y-6 animate-in fade-in duration-300 pb-12">
      {/* Target Database Context & Cache Control Header (Full Width) */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 p-4 px-6 rounded-2xl shadow-2xs">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-950/80 rounded-xl text-blue-600 dark:text-blue-400 border border-blue-200/80 dark:border-blue-800/80">
              <Database size={18} />
            </div>
            <div className="flex flex-col justify-center">
              <span className="text-base font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight uppercase">
                Target Database Context
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <div className="h-1 w-1 rounded-full bg-blue-500/60 dark:bg-blue-400/60"></div>
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 leading-none tracking-wider uppercase font-sans">
                  {currentSchema?.databaseName || "Target Database"} • {currentSchema?.tables?.length || 0} Tables Registered
                </span>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto justify-end">
            {/* Target DB Selector */}
            <div className="relative flex items-center min-w-[220px]" ref={dbMenuRef}>
              <button
                onClick={() => setIsDbDropdownOpen(!isDbDropdownOpen)}
                className="w-full flex items-center justify-between bg-slate-50 dark:bg-slate-800 border border-slate-200/90 dark:border-slate-700 rounded-xl py-2 px-3 text-sm font-extrabold text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer shadow-2xs transition-all hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <div className="truncate flex items-center gap-2">
                  <Database size={14} className="text-blue-500 shrink-0" />
                  <span className="truncate">
                    {connections?.find(c => c.id === currentConnId)?.connectionName || "Select Connection..."}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-slate-500 shrink-0 transition-transform duration-200 ${isDbDropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {isDbDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl border border-slate-200/90 dark:border-slate-700/80 rounded-xl shadow-2xl shadow-slate-400/20 dark:shadow-black/80 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200 ring-1 ring-black/5 dark:ring-white/5">
                  <div className="max-h-60 overflow-y-auto custom-scrollbar p-1.5 space-y-0.5">
                    {connections && connections.length > 0 ? (
                      connections.map((conn) => (
                        <button
                          key={conn.id}
                          onClick={() => {
                            handleConnectionChange(conn.id);
                            setIsDbDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors text-left cursor-pointer ${
                            currentConnId === conn.id ? "bg-blue-50 dark:bg-blue-900/20" : ""
                          }`}
                        >
                          <Database size={14} className={currentConnId === conn.id ? "text-blue-600 dark:text-blue-400 shrink-0" : "text-slate-400 shrink-0"} />
                          <div className="flex-1 min-w-0">
                            <div className={`text-[13px] font-bold truncate ${currentConnId === conn.id ? "text-blue-600 dark:text-blue-400" : "text-slate-700 dark:text-slate-200"}`}>
                              {conn.connectionName}
                            </div>
                            <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 font-mono mt-0.5 tracking-wider truncate">
                              ({conn.databaseName || conn.databaseType || "Unknown DB"})
                            </div>
                          </div>
                          {currentConnId === conn.id && (
                            <Check size={14} className="text-blue-600 dark:text-blue-400 shrink-0" />
                          )}
                        </button>
                      ))
                    ) : (
                      <div className="px-4 py-3 text-xs text-slate-500 text-center font-medium italic">
                        No Connections Available
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cache Status Badge */}
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold shadow-2xs">
              <Zap size={13} className="fill-emerald-500 text-emerald-500" />
              <span>{currentSchema?.cacheStatus === "FRESH" ? "CACHE: RESCANNED" : "CACHE: MEMORY OK"}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-xl text-xs font-bold shadow-xs transition-all cursor-pointer disabled:opacity-50"
            >
              <RotateCw size={13} className={isRefreshing ? "animate-spin" : ""} />
              <span>{isRefreshing ? "Scanning..." : "Refresh Schema"}</span>
            </button>
          </div>
        </div>

        {/* 12-Column Main Workspace */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Left Panel: Table Explorer Tree (3 Cols) */}
          <div className="lg:col-span-3 space-y-3">
            <Card glass={false} className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-3">
              {/* Search Bar */}
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Filter tables or cols..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl py-1.5 pl-8 pr-2.5 text-sm font-semibold font-sans text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                />
              </div>

              {/* Table Counter */}
              <div className="flex items-center justify-between text-[11px] font-bold text-slate-500 px-1 uppercase tracking-wider font-sans">
                <span>Tables ({filteredTables.length})</span>
                <span>{currentSchema?.relationships?.length || 0} Foreign Keys</span>
              </div>

              {/* Table List Tree */}
              <div className="space-y-1 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
                {filteredTables.map((tbl) => {
                  const isSelected = tbl.tableName === selectedTableName;
                  const isView = tbl.tableType === "VIEW";
                  const colCount = tbl.columns?.length || 0;

                  return (
                    <button
                      key={tbl.tableName}
                      onClick={() => setSelectedTableName(tbl.tableName)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                          : "bg-slate-50/70 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-100 dark:border-slate-800/60"
                      }`}
                    >
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <TableIcon size={15} className={isSelected ? "text-white" : isView ? "text-amber-500 shrink-0" : "text-blue-500 shrink-0"} />
                        <span className="text-sm font-sans font-semibold tracking-wide truncate">{tbl.tableName}</span>
                      </div>

                      <span
                        title={`${colCount} Columns`}
                        className={`ml-2 px-1.5 py-0.5 text-[10px] font-extrabold tracking-wide uppercase rounded shrink-0 border ${
                          isSelected
                            ? "bg-white/20 text-white border-white/30"
                            : isView
                            ? "bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border-amber-200 dark:border-amber-800"
                            : "bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border-blue-200 dark:border-blue-800"
                        }`}
                      >
                        {isView ? "VIEW" : `${colCount} Cols`}
                      </span>
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Right Panel: Object Details, Column Inspector, Relationships (9 Cols) */}
          <div className="lg:col-span-9">
            {activeTable ? (
              <Card glass={false} className="p-5 sm:p-6 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl shadow-2xs space-y-5">
                {/* Active Table Summary & Tab Controls */}
                {(() => {
                  const activeTableRelationsCount = currentSchema?.relationships?.filter(
                    (r) => r.parentTable === activeTable.tableName || r.childTable === activeTable.tableName
                  ).length || 0;

                  return (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white font-mono truncate">
                            {activeTable.tableName}
                          </h2>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold uppercase bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 rounded-md shrink-0">
                            {activeTable.tableType || "TABLE"}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 font-medium">
                          Metadata Definition • {activeTable.columns?.length || 0} Columns Registered • {activeTableRelationsCount} Foreign Relations
                        </p>
                      </div>

                      {/* Navigation Tabs */}
                      <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800/80 p-1 rounded-xl text-xs font-bold shrink-0">
                        <button
                          onClick={() => setActiveTab("columns")}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            activeTab === "columns"
                              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold"
                              : "text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
                          }`}
                        >
                          Columns ({activeTable.columns?.length || 0})
                        </button>
                        <button
                          onClick={() => setActiveTab("relationships")}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            activeTab === "relationships"
                              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold"
                              : "text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
                          }`}
                        >
                          Relations ({activeTableRelationsCount})
                        </button>
                        <button
                          onClick={() => setActiveTab("json")}
                          className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                            activeTab === "json"
                              ? "bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-2xs font-extrabold"
                              : "text-slate-500 hover:text-slate-900 dark:hover:text-white font-semibold"
                          }`}
                        >
                          JSON
                        </button>
                      </div>
                    </div>
                  );
                })()}

                {/* TAB 1: COLUMNS TABLE */}
                {activeTab === "columns" && (
                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xs">
                    <table className="w-full text-left text-sm font-sans tracking-wide">
                      <thead className="bg-slate-100/90 dark:bg-slate-800/90 text-slate-800 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700">
                        <tr>
                          <th className="p-3 font-semibold uppercase text-xs text-slate-600 dark:text-slate-300">Column Name</th>
                          <th className="p-3 font-semibold uppercase text-xs text-slate-600 dark:text-slate-300">Data Type</th>
                          <th className="p-3 font-semibold uppercase text-xs text-slate-600 dark:text-slate-300">Nullable</th>
                          <th className="p-3 font-semibold uppercase text-xs text-slate-600 dark:text-slate-300">Key / Attributes</th>
                          <th className="p-3 font-semibold uppercase text-xs text-slate-600 dark:text-slate-300">Default Value</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
                        {activeTable.columns?.map((col) => (
                          <tr key={col.columnName} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                            <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                              {col.primaryKey && <Key size={13} className="text-amber-500 shrink-0" title="Primary Key" />}
                              <span>{col.columnName}</span>
                            </td>

                            <td className="p-3">
                              <span className={`px-2 py-0.5 text-[10px] font-extrabold uppercase rounded border ${getDataTypeBadgeClass(col.dataType)}`}>
                                {col.dataType} {col.length ? `(${col.length})` : ""}
                              </span>
                            </td>

                            <td className="p-3">
                              {col.nullable ? (
                                <span className="px-1.5 py-0.5 text-[10px] font-bold text-slate-500 bg-slate-100 dark:bg-slate-800 rounded">
                                  YES
                                </span>
                              ) : (
                                <span className="px-1.5 py-0.5 text-[10px] font-extrabold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 rounded">
                                  NOT NULL
                                </span>
                              )}
                            </td>

                            <td className="p-3">
                              <div className="flex flex-wrap items-center gap-1">
                                {col.primaryKey && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-black text-amber-700 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/80 border border-amber-300 dark:border-amber-800 rounded">
                                    PRIMARY KEY
                                  </span>
                                )}
                                {col.autoIncrement && (
                                  <span className="px-1.5 py-0.5 text-[9px] font-black text-blue-700 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 border border-blue-200 dark:border-blue-800 rounded">
                                    AUTO_INC
                                  </span>
                                )}
                                {!col.primaryKey && !col.autoIncrement && <span className="text-slate-400">-</span>}
                              </div>
                            </td>

                            <td className="p-3 text-slate-500 font-mono text-[12px]">
                              {col.defaultValue || <span className="text-slate-400 italic font-sans">null</span>}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}

                {/* TAB 2: RELATIONSHIPS MATRIX */}
                {activeTab === "relationships" && (
                  <div className="space-y-4">
                    {currentSchema?.relationships?.filter((r) => r.parentTable === activeTable.tableName || r.childTable === activeTable.tableName).length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {currentSchema.relationships
                          .filter((r) => r.parentTable === activeTable.tableName || r.childTable === activeTable.tableName)
                          .map((rel, idx) => (
                            <div
                              key={idx}
                              className="p-4 bg-slate-50/80 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/80 rounded-2xl space-y-3 overflow-hidden"
                            >
                              <div className="flex items-center justify-between">
                                <span className="px-2 py-0.5 text-[10px] font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 rounded uppercase">
                                  {rel.relationshipType || "ONE_TO_MANY"}
                                </span>
                                <Link2 size={15} className="text-slate-400" />
                              </div>

                              <div className="space-y-2 font-mono text-xs">
                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-slate-400 text-[10px] uppercase font-sans font-bold block mb-0.5">Parent Entity:</span>
                                  <strong className="text-blue-600 dark:text-blue-400 truncate block font-mono text-xs">
                                    {rel.parentTable}.{rel.parentColumn}
                                  </strong>
                                </div>
                                <div className="p-2.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800">
                                  <span className="text-slate-400 text-[10px] uppercase font-sans font-bold block mb-0.5">Child Foreign Key:</span>
                                  <strong className="text-emerald-600 dark:text-emerald-400 truncate block font-mono text-xs">
                                    {rel.childTable}.{rel.childColumn}
                                  </strong>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    ) : (
                      <div className="p-8 text-center bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                        <Link2 size={26} className="mx-auto text-slate-400" />
                        <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">No Foreign Key Linkages</h4>
                        <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                          This table has no explicit foreign key dependencies mapped in the metadata cache.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TAB 3: RAW JSON */}
                {activeTab === "json" && (
                  <div className="p-4 bg-slate-950 text-emerald-400 rounded-2xl font-mono text-xs border border-slate-800 overflow-x-auto max-h-96">
                    <pre>{JSON.stringify(activeTable, null, 2)}</pre>
                  </div>
                )}
              </Card>
            ) : (
              <Card glass={false} className="p-8 text-center bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                <Database size={32} className="mx-auto text-slate-400" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">No Table Selected</h3>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Select a table from the left database tree to inspect its column metadata, indexes, and foreign keys.
                </p>
              </Card>
            )}
          </div>
        </div>
      </div>
  );
};

export default SchemaExplorer;
