import api from "./api";

// Initial Offline Sessions Mock for testing when backend APIs are offline
const INITIAL_MOCK_SESSIONS = [
  {
    id: "sess-101",
    title: "University Students & CGPA Analysis",
    connectionId: 1,
    messageCount: 2,
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    messages: [
      {
        id: "msg-101-1",
        role: "USER",
        message: "Show all Computer Science students with CGPA > 3.5",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
      {
        id: "msg-101-2",
        role: "ASSISTANT",
        message: "Executed SQL query for: \"Show all Computer Science students with CGPA > 3.5\"",
        generatedSql: `SELECT s.student_id, s.name, s.cgpa\nFROM students s\nJOIN departments d ON s.department_id = d.department_id\nWHERE d.department_name = 'Computer Science'\n  AND s.cgpa > 3.5;`,
        columns: ["student_id", "name", "cgpa"],
        rows: [
          [101, "Ali Khan", 3.85],
          [104, "Sara Ahmed", 3.92],
          [109, "Usman Tariq", 3.65],
          [112, "Zainab Fatima", 3.78],
        ],
        rowCount: 4,
        executionTimeMs: 42,
        model: "llama-3.3-70b-versatile (Groq)",
        createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
      },
    ],
  },
  {
    id: "sess-102",
    title: "Departments & Building Directory",
    connectionId: 1,
    messageCount: 2,
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    lastMessageAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    messages: [
      {
        id: "msg-102-1",
        role: "USER",
        message: "List all departments and their building codes",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
      {
        id: "msg-102-2",
        role: "ASSISTANT",
        message: "Executed SQL query for: \"List all departments and their building codes\"",
        generatedSql: `SELECT department_id, department_name, building_code, head_of_department\nFROM departments\nORDER BY department_name ASC;`,
        columns: ["department_id", "department_name", "building_code", "head_of_department"],
        rows: [
          [1, "Computer Science", "CS-BLOCK-A", "Dr. Ayesha Malik"],
          [2, "Electrical Engineering", "EE-BLOCK-B", "Dr. Tariq Mahmood"],
          [3, "Management Sciences", "MS-BLOCK-C", "Dr. Bilal Hassan"],
        ],
        rowCount: 3,
        executionTimeMs: 34,
        model: "gemini-1.5-flash",
        createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
      },
    ],
  },
];

const getLocalStore = () => {
  try {
    const cached = localStorage.getItem("offline_chat_sessions");
    if (cached) return JSON.parse(cached);
  } catch (e) {
    console.warn("Failed to load cached sessions:", e);
  }
  return [...INITIAL_MOCK_SESSIONS];
};

const saveLocalStore = (store) => {
  try {
    localStorage.setItem("offline_chat_sessions", JSON.stringify(store));
  } catch (e) {
    console.warn("Failed to save sessions cache:", e);
  }
};

let localSessionsStore = getLocalStore();


export const chatSessionService = {
  /**
   * Fetch all conversation sessions for the active user.
   * Calls GET /api/chat/sessions
   */
  fetchSessions: async () => {
    try {
      const response = await api.get("/chat/sessions");
      const payload = response.data;
      return payload?.data || payload || [];
    } catch (error) {
      console.warn("[chatSessionService] Using offline sessions cache.", error?.message);
      return localSessionsStore.map((s) => ({
        id: s.id,
        title: s.title,
        connectionId: s.connectionId,
        messageCount: s.messages?.length || s.messageCount || 0,
        createdAt: s.createdAt,
        lastMessageAt: s.lastMessageAt,
      }));
    }
  },

  /**
   * Create a new conversation session.
   * Calls POST /api/chat/sessions
   */
  createSession: async (title = "New Chat Session", connectionId) => {
    try {
      const reqBody = { title };
      if (connectionId && Number(connectionId) > 0) {
        reqBody.connectionId = Number(connectionId);
      }
      const response = await api.post("/chat/sessions", reqBody);
      const payload = response.data;
      return payload?.data || payload;
    } catch (error) {
      console.warn("[chatSessionService] Offline mode: Creating session locally.", error?.message);
      const newSess = {
        id: `sess-${Date.now()}`,
        title,
        connectionId: connectionId ? Number(connectionId) : 1,
        messageCount: 0,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
        messages: [],
      };
      localSessionsStore = [newSess, ...localSessionsStore];
      saveLocalStore(localSessionsStore);
      return newSess;
    }
  },

  /**
   * Rename a conversation session title.
   * Calls PUT /api/chat/sessions/{id}
   */
  renameSession: async (sessionId, title) => {
    try {
      const response = await api.put(`/chat/sessions/${sessionId}`, { title });
      const payload = response.data;
      return payload?.data || payload;
    } catch (error) {
      console.warn(`[chatSessionService] Offline mode: Renaming session ${sessionId} locally.`, error?.message);
      localSessionsStore = localSessionsStore.map((s) =>
        s.id === sessionId ? { ...s, title, updatedAt: new Date().toISOString() } : s
      );
      saveLocalStore(localSessionsStore);
      return { id: sessionId, title };
    }
  },

  /**
   * Delete a conversation session.
   * Calls DELETE /api/chat/sessions/{id}
   */
  deleteSession: async (sessionId) => {
    try {
      await api.delete(`/chat/sessions/${sessionId}`);
      return true;
    } catch (error) {
      console.warn(`[chatSessionService] Offline mode: Deleting session ${sessionId} locally.`, error?.message);
      localSessionsStore = localSessionsStore.filter((s) => s.id !== sessionId);
      saveLocalStore(localSessionsStore);
      return true;
    }
  },

  /**
   * Fetch historical messages for a specific session (0 AI tokens consumed).
   * Calls GET /api/chat/sessions/{id}/messages
   */
  fetchSessionMessages: async (sessionId) => {
    try {
      const response = await api.get(`/chat/sessions/${sessionId}/messages`);
      const payload = response.data;
      return payload?.data || payload || [];
    } catch (error) {
      console.warn(`[chatSessionService] Offline mode: Fetching messages for session ${sessionId}.`, error?.message);
      const found = localSessionsStore.find((s) => s.id === sessionId);
      return found?.messages || [];
    }
  },
};

export default chatSessionService;
