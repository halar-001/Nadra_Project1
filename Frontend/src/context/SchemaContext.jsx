import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import schemaService from "../services/schemaService";
import { useConnection } from "./ConnectionContext";

const SchemaContext = createContext();

export const SchemaProvider = ({ children }) => {
  const { selectedConnectionId } = useConnection();
  const [schemaMap, setSchemaMap] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState(null);

  // Fetch schema for a specific connectionId and store in cache map
  const fetchSchema = useCallback(async (connectionId, forceRefresh = false) => {
    if (!connectionId) return null;

    // Check memory cache first if not forcing refresh
    if (!forceRefresh && schemaMap[connectionId]) {
      return schemaMap[connectionId];
    }

    if (forceRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      const data = forceRefresh
        ? await schemaService.refreshSchema(connectionId)
        : await schemaService.getSchema(connectionId);

      if (data) {
        setSchemaMap((prev) => ({
          ...prev,
          [connectionId]: data,
        }));
      }
      return data;
    } catch (err) {
      const msg = err?.response?.data?.message || err?.message || "Failed to load database schema";
      setError(msg);
      throw new Error(msg);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [schemaMap]);

  // Convenience helper to refresh current active connection schema
  const refreshSchema = useCallback(async (connectionId) => {
    const targetId = connectionId || selectedConnectionId;
    return await fetchSchema(targetId, true);
  }, [selectedConnectionId, fetchSchema]);

  // Auto-fetch schema whenever target connectionId changes
  useEffect(() => {
    if (selectedConnectionId) {
      fetchSchema(selectedConnectionId);
    }
  }, [selectedConnectionId, fetchSchema]);

  const activeSchema = selectedConnectionId ? schemaMap[selectedConnectionId] || null : null;

  return (
    <SchemaContext.Provider
      value={{
        schemaMap,
        activeSchema,
        isLoading,
        isRefreshing,
        error,
        fetchSchema,
        refreshSchema,
      }}
    >
      {children}
    </SchemaContext.Provider>
  );
};

export const useSchema = () => {
  const context = useContext(SchemaContext);
  if (!context) {
    throw new Error("useSchema must be used within a SchemaProvider");
  }
  return context;
};

export default SchemaContext;
