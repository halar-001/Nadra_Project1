import React, { useState, useEffect } from 'react';
import AuditFilters from '../components/audit/AuditFilters';
import AuditTable from '../components/audit/AuditTable';
import api from '../services/api';
import { ShieldCheck } from 'lucide-react';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeFilters, setActiveFilters] = useState({});

  useEffect(() => {
    fetchAuditLogs(activeFilters);
  }, [activeFilters]);

  const fetchAuditLogs = async (filters) => {
    setLoading(true);
    setError(null);
    try {
      // Build query string from active filters
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, value);
      });

      // API call to backend (will fail until Phase 9A backend is implemented)
      const response = await api.get(`/audit?${params.toString()}`);
      
      // Assuming response.data contains the logs (could be response.data.content if paginated)
      const fetchedLogs = response.data.content || response.data || [];
      setLogs(fetchedLogs);
    } catch (err) {
      console.warn("Backend for /api/audit not yet implemented. Displaying empty logs.", err);
      // Fallback for demonstration since backend isn't built yet
      setLogs([]);
      // You could set mock data here if desired
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-indigo-100 dark:bg-indigo-900/50 rounded-lg">
          <ShieldCheck className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">System Audit Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Monitor and review all centralized system security and operational events.</p>
        </div>
      </div>

      <AuditFilters onFilterChange={setActiveFilters} />
      
      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm border border-red-200 dark:border-red-800">
          {error}
        </div>
      )}

      <AuditTable logs={logs} loading={loading} />
      
    </div>
  );
};

export default AuditLogs;
