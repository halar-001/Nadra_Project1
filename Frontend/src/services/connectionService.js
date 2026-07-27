import api from "./api";

/**
 * Database Connection Service handling API calls for Phase 3 (Architecture V2).
 */
export const connectionService = {
  /**
   * Test database credentials before saving (POST /api/connections/test).
   * @param {Object} data - { databaseType, host, port, databaseName, username, password }
   */
  async testConnection(data) {
    const response = await api.post("/connections/test", {
      databaseType: data.databaseType,
      host: data.host,
      port: Number(data.port),
      databaseName: data.databaseName,
      username: data.username,
      password: data.password,
    });
    return response.data;
  },

  /**
   * Create a new database connection (POST /api/connections).
   * @param {Object} data - { connectionName, databaseType, host, port, databaseName, username, password }
   */
  async createConnection(data) {
    const response = await api.post("/connections", {
      connectionName: data.connectionName,
      databaseType: data.databaseType,
      host: data.host,
      port: Number(data.port),
      databaseName: data.databaseName,
      username: data.username,
      password: data.password,
    });
    return response.data;
  },

  /**
   * Fetch all database connections for the logged-in user (GET /api/connections).
   */
  async getConnections() {
    const response = await api.get("/connections");
    return response.data;
  },

  /**
   * Fetch single database connection by ID (GET /api/connections/{id}).
   * @param {number|string} id
   */
  async getConnectionById(id) {
    const response = await api.get(`/connections/${id}`);
    return response.data;
  },

  /**
   * Update existing database connection (PUT /api/connections/{id}).
   * @param {number|string} id
   * @param {Object} data
   */
  async updateConnection(id, data) {
    const response = await api.put(`/connections/${id}`, {
      connectionName: data.connectionName,
      databaseType: data.databaseType,
      host: data.host,
      port: Number(data.port),
      databaseName: data.databaseName,
      username: data.username,
      password: data.password,
    });
    return response.data;
  },

  /**
   * Delete a database connection by ID (DELETE /api/connections/{id}).
   * @param {number|string} id
   */
  async deleteConnection(id) {
    const response = await api.delete(`/connections/${id}`);
    return response.data;
  },

  /**
   * Fetch all database connections across all users for Admin (GET /api/connections/admin/all).
   */
  async getAdminConnections() {
    const response = await api.get("/connections/admin/all");
    return response.data;
  },
};

export default connectionService;
