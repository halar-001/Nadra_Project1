import React from 'react';
import SeverityBadge from './SeverityBadge';

const AuditTable = ({ logs, loading }) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!logs || logs.length === 0) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 p-12 text-center text-slate-500 dark:text-slate-400">
        No audit logs found matching the current filters.
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-700">
              <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Time</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">User</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Event</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider">Severity</th>
              <th className="px-4 py-3 text-xs font-semibold text-slate-600 dark:text-slate-300 uppercase tracking-wider w-1/3">Description</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
            {logs.map((log) => (
              <tr key={log.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400 whitespace-nowrap">
                  {new Date(log.createdAt).toLocaleString()}
                </td>
                <td className="px-4 py-3 text-sm font-medium text-slate-800 dark:text-slate-200">
                  {log.userName || log.userId || 'System'}
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-300 font-mono text-xs">
                  {log.eventType}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <SeverityBadge severity={log.severity} />
                </td>
                <td className="px-4 py-3 text-sm text-slate-600 dark:text-slate-400">
                  {log.description}
                  {log.executionTimeMs && (
                    <span className="block text-xs text-slate-400 mt-1">
                      Execution Time: {log.executionTimeMs}ms
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AuditTable;
