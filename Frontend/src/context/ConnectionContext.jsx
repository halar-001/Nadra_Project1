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
  const { user, isAuthenticated } = useAuth();
  const userKey = user?.email || user?.id || "guest";

  const [connections, setConnections] = useState([]);
  const [selectedConnectionId, setSelectedConnectionIdState] = useState(() => {
    const saved = localStorage.getItem(`selectedConnectionId_${userKey}`);
    return saved ? Number(saved) : 1;
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Helper to load user's offline connections
  const getOfflineUserConnections = useCallback(() => {
    const raw = localStorage.getItem(`user_connections_${userKey}`);
    if (raw) {
      try {
        return JSON.parse(raw);
      } catch (e) {
        return [];
      }
    }
    return MOCK_CONNECTIONS;
  }, [userKey]);

  // Set selected connection ID & persist per user
  const setSelectedConnectionId = (id) => {
    const numId = Number(id);
    setSelectedConnectionIdState(numId);
    localStorage.setItem(`selectedConnectionId_${userKey}`, String(numId));
  };

  // Fetch connections from backend API
  const fetchConnections = useCallback(async () => {
    if (!isAuthenticated) {
      setConnections(MOCK_CONNECTIONS);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const res = await connectionService.getConnections();
      const raw = res?.data;
      const list = Array.isArray(raw?.data) ? raw.data : Array.isArray(raw) ? raw : Array.isArray(res) ? res : null;

      if (list !== null) {
        setConnections(list);
        if (list.length > 0 && !list.some((c) => c.id === selectedConnectionId)) {
          setSelectedConnectionId(list[0].id);
        }
        return;
      }
    } catch (err) {
      if (!err.response) {
        // Backend is offline (network error) -> Fallback to per-user local storage or mock
        console.warn("Backend API offline, using local connections.", err?.message);
        const localList = getOfflineUserConnections();
        setConnections(localList.length > 0 ? localList : MOCK_CONNECTIONS);
        if (localList.length > 0 && !localList.some((c) => c.id === selectedConnectionId)) {
          setSelectedConnectionId(localList[0].id);
        }
      } else {
        // Backend is online but returned an error (e.g. 401)
        console.warn("Backend connections API returned an error.", err?.response?.status, err?.message);
        setConnections([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, selectedConnectionId, getOfflineUserConnections, userKey]);

  useEffect(() => {
    fetchConnections();
  }, [userKey, isAuthenticated]);

  // Test connection credentials
  const testConnection = async (data) => {
    try {
      const res = await connectionService.testConnection(data);
      if (res && (res.success === false || res.data?.success === false)) {
        throw new Error(res.message || res.data?.message || "JDBC connection failed. Verify database username, password, host, and port.");
      }
      return res;
    } catch (err) {
      if (err.response?.status === 403 || err.response?.status === 401) {
        throw new Error("Session expired or unauthorized (403 Forbidden). Please log out and log in again.");
      }
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
      // Fallback for offline dev: save into user-isolated local storage
      const newConn = {
        id: Date.now(),
        userEmail: user?.email,
        connectionName: data.connectionName || data.databaseName,
        databaseType: data.databaseType,
        host: data.host,
        port: Number(data.port),
        databaseName: data.databaseName,
        username: data.username,
      };
      setConnections((prev) => {
        const updated = [...prev, newConn];
        localStorage.setItem(`user_connections_${userKey}`, JSON.stringify(updated));
        return updated;
      });
      setSelectedConnectionId(newConn.id);
      return { success: true, message: "Connection saved locally for user", data: newConn };
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

  // Fetch admin connections across all users
  const fetchAdminConnections = async () => {
    try {
      const res = await connectionService.getAdminConnections();
      return res?.data || res || [];
    } catch (err) {
      console.warn("Could not fetch admin connections endpoint, fallback to current user connections.", err?.message);
      return connections;
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
        fetchAdminConnections,
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
