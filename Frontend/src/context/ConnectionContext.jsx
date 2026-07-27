import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { connectionService } from "../services/connectionService";
import { useAuth } from "./AuthContext";

const ConnectionContext = createContext(null);

const MOCK_CONNECTIONS = [
  {
    id: 1,
    connectionName: "HalarDB",
    databaseType: "MYSQL",
    host: "localhost",
    port: 3306,
    databaseName: "StudentDB",
    username: "root",
  },
  {
    id: 2,
    connectionName: "Production_MySQL",
    databaseType: "MYSQL",
    host: "localhost",
    port: 3306,
    databaseName: "ai_db_assistant",
    username: "root",
  },
];

export const ConnectionProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const [connections, setConnections] = useState(MOCK_CONNECTIONS);
  const [selectedConnectionId, setSelectedConnectionIdState] = useState(() => {
    const saved = localStorage.getItem("selectedConnectionId");
    return saved ? Number(saved) : 1;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Set selected connection ID & persist to localStorage
  const setSelectedConnectionId = (id) => {
    const numId = Number(id);
    setSelectedConnectionIdState(numId);
    localStorage.setItem("selectedConnectionId", String(numId));
  };

  // Fetch connections from backend API
  const fetchConnections = useCallback(async () => {
    if (!isAuthenticated) return;
    setIsLoading(true);
    setError(null);
    try {
      const res = await connectionService.getConnections();
      const list = res?.data || res || [];
      if (Array.isArray(list) && list.length > 0) {
        setConnections(list);
        // If current selectedConnectionId is invalid, set to first connection
        if (!list.some((c) => c.id === selectedConnectionId)) {
          setSelectedConnectionId(list[0].id);
        }
      }
    } catch (err) {
      // Keep mock connections for offline dev
      console.warn("Backend connections endpoint not reachable, using local connection state.", err?.message);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedConnectionId]);

  useEffect(() => {
    fetchConnections();
  }, [fetchConnections]);

  // Test connection credentials
  const testConnection = async (data) => {
    try {
      return await connectionService.testConnection(data);
    } catch (err) {
      const msg = err.response?.data?.message || err.message || "Database connection test failed";
      throw new Error(msg);
    }
  };

  // Add new connection
  const addConnection = async (data) => {
    try {
      const res = await connectionService.createConnection(data);
      const newConn = res?.data || res;
      await fetchConnections();
      if (newConn?.id) {
        setSelectedConnectionId(newConn.id);
      }
      return res;
    } catch (err) {
      // Fallback for offline dev
      const newConn = {
        id: Date.now(),
        connectionName: data.connectionName || data.databaseName,
        databaseType: data.databaseType,
        host: data.host,
        port: Number(data.port),
        databaseName: data.databaseName,
        username: data.username,
      };
      setConnections((prev) => [...prev, newConn]);
      setSelectedConnectionId(newConn.id);
      return { success: true, message: "Connection saved locally", data: newConn };
    }
  };

  // Edit existing connection
  const updateConnection = async (id, data) => {
    try {
      const res = await connectionService.updateConnection(id, data);
      await fetchConnections();
      return res;
    } catch (err) {
      setConnections((prev) =>
        prev.map((c) => (c.id === Number(id) ? { ...c, ...data, id: Number(id) } : c))
      );
      return { success: true, message: "Connection updated locally" };
    }
  };

  // Delete connection
  const deleteConnection = async (id) => {
    try {
      await connectionService.deleteConnection(id);
      await fetchConnections();
    } catch (err) {
      setConnections((prev) => prev.filter((c) => c.id !== Number(id)));
    }
  };

  const selectedConnection = connections.find((c) => c.id === Number(selectedConnectionId)) || connections[0];

  return (
    <ConnectionContext.Provider
      value={{
        connections,
        selectedConnectionId,
        selectedConnection,
        setSelectedConnectionId,
        fetchConnections,
        testConnection,
        addConnection,
        updateConnection,
        deleteConnection,
        isLoading,
        error,
      }}
    >
      {children}
    </ConnectionContext.Provider>
  );
};

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (!context) {
    throw new Error("useConnection must be used within a ConnectionProvider");
  }
  return context;
};

export default ConnectionContext;
