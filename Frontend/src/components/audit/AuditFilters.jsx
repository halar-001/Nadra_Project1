import React, { useState } from 'react';
import { Filter, Search } from 'lucide-react';

const AuditFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    dateFrom: '',
    dateTo: '',
    severity: '',
    eventType: '',
    userId: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const eventTypes = [
    'LOGIN', 'LOGOUT', 'REGISTER', 'PROFILE_UPDATED', 'PASSWORD_CHANGED',
    'CONNECTION_CREATED', 'CONNECTION_UPDATED', 'CONNECTION_DELETED', 'CONNECTION_TESTED',
    'CHAT_CREATED', 'CHAT_RENAMED', 'CHAT_DELETED',
    'QUERY_EXECUTED', 'QUERY_FAILED', 'AI_PROVIDER_USED', 'AI_PROVIDER_FALLBACK',
    'POLICY_VIOLATION', 'UNAUTHORIZED_ACCESS', 'INVALID_JWT', 'CSV_EXPORTED'
  ];

  return (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow-sm border border-slate-200 dark:border-slate-700 mb-6">
      <div className="flex items-center gap-2 mb-4 text-slate-800 dark:text-slate-200 font-semibold">
        <Filter className="w-5 h-5 text-indigo-500" />
        <h2>Filter Audit Logs</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Date From */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">From Date</label>
          <input
            type="date"
            name="dateFrom"
            value={filters.dateFrom}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Date To */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">To Date</label>
          <input
            type="date"
            name="dateTo"
            value={filters.dateTo}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Severity */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Severity</label>
          <select
            name="severity"
            value={filters.severity}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Severities</option>
            <option value="INFO">INFO</option>
            <option value="WARNING">WARNING</option>
            <option value="ERROR">ERROR</option>
            <option value="SECURITY">SECURITY</option>
          </select>
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Event Type</label>
          <select
            name="eventType"
            value={filters.eventType}
            onChange={handleChange}
            className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">All Events</option>
            {eventTypes.map(et => (
              <option key={et} value={et}>{et}</option>
            ))}
          </select>
        </div>

        {/* User Search */}
        <div>
          <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">User ID / Email</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              name="userId"
              value={filters.userId}
              onChange={handleChange}
              placeholder="Search user..."
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-md pl-9 pr-3 py-2 text-sm text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditFilters;
