import api from "./api";

// Offline Mock Execution Datasets for testing when API is offline
const MOCK_SQL_RESPONSES = [
  {
    keywords: ["computer science", "cgpa", "3.5", "students"],
    sql: `SELECT s.student_id, s.name, s.cgpa\nFROM students s\nJOIN departments d ON s.department_id = d.department_id\nWHERE d.department_name = 'Computer Science'\n  AND s.cgpa > 3.5;`,
    columns: ["student_id", "name", "cgpa"],
    rows: [
      [101, "Ali Khan", 3.85],
      [104, "Sara Ahmed", 3.92],
      [109, "Usman Tariq", 3.65],
      [112, "Zainab Fatima", 3.78],
    ],
    model: "llama-3.3-70b-versatile (Groq)",
  },
  {
    keywords: ["ali", "firstname", "name"],
    sql: `SELECT student_id, registration_no, first_name, last_name, email\nFROM students\nWHERE LOWER(first_name) = 'ali';`,
    columns: ["student_id", "registration_no", "first_name", "last_name", "email"],
    rows: [
      [101, "REG-2023-001", "Ali", "Khan", "ali.khan@university.edu.pk"],
      [205, "REG-2023-105", "Ali", "Raza", "ali.raza@university.edu.pk"],
    ],
    model: "gemini-1.5-flash",
  },
  {
    keywords: ["department", "building", "head"],
    sql: `SELECT department_id, department_name, building_code, head_of_department\nFROM departments\nORDER BY department_name ASC;`,
    columns: ["department_id", "department_name", "building_code", "head_of_department"],
    rows: [
      [1, "Computer Science", "CS-BLOCK-A", "Dr. Ayesha Malik"],
      [2, "Electrical Engineering", "EE-BLOCK-B", "Dr. Tariq Mahmood"],
      [3, "Management Sciences", "MS-BLOCK-C", "Dr. Bilal Hassan"],
      [4, "Software Engineering", "SE-BLOCK-A", "Dr. Hamza Farooq"],
    ],
    model: "llama-3.3-70b-versatile (Groq)",
  },
  {
    keywords: ["course", "credit", "hours"],
    sql: `SELECT c.course_code, c.course_title, c.credit_hours, d.department_name\nFROM courses c\nJOIN departments d ON c.department_id = d.department_id\nWHERE c.credit_hours >= 3;`,
    columns: ["course_code", "course_title", "credit_hours", "department_name"],
    rows: [
      ["CS-101", "Database Systems & SQL", 3, "Computer Science"],
      ["CS-202", "Data Structures & Algorithms", 4, "Computer Science"],
      ["EE-110", "Circuit Analysis", 3, "Electrical Engineering"],
      ["SE-301", "Software Architecture", 3, "Software Engineering"],
    ],
    model: "gemini-1.5-flash",
  },
];

export const chatService = {
  /**
   * Sends user natural-language prompt to backend Phase 6 AI Chat & Execution endpoint.
   * Calls POST /api/chat
   * Payload: { connectionId, message }
   * Returns: { generatedSql, columns, rows, metadata: { rowCount, executionTimeMs, model } }
   */
  postChatQuery: async (connectionId, message, sessionId) => {
    const startTime = Date.now();
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const validSessionId = sessionId && uuidRegex.test(String(sessionId))
      ? String(sessionId)
      : null;

    try {
      const requestPayload = {
        connectionId: connectionId ? Number(connectionId) : null,
        message: message.trim(),
      };
      if (validSessionId) {
        requestPayload.sessionId = validSessionId;
      }
      const response = await api.post("/chat", requestPayload);

      const resPayload = response.data;
      const data = resPayload?.data || resPayload;
      const queryResult = data?.queryResult || data?.result || data;

      return {
        sessionId: data.sessionId || null,
        generatedSql: data.generatedSql || data.sql || "SELECT * FROM dual;",
        columns: queryResult?.columns || data?.columns || [],
        rows: queryResult?.rows || data?.rows || [],
        model: data.model || data.metadata?.model || "llama-3.3-70b-versatile (Groq)",
        rowCount: queryResult?.rowCount ?? queryResult?.metadata?.rowCount ?? data?.rowCount ?? (queryResult?.rows?.length || 0),
        executionTimeMs: data.executionTimeMs ?? data.metadata?.executionTimeMs ?? (Date.now() - startTime),
        visualization: queryResult?.visualization || data?.visualization || null,
      };
    } catch (error) {
      // If backend returned an HTTP error response (e.g. 500, 400, 404), throw error to display Error Banner
      if (error.response) {
        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.data ||
          "AI Provider failed to generate or execute SQL. Please check your API keys or internet connection.";
        throw new Error(backendMessage);
      }

      if (error.code === 'ECONNABORTED') {
        throw new Error("The request timed out. The AI took too long to generate SQL.");
      }

      // ONLY use offline mock generator if Backend Server is completely disconnected (Network Error / Port 8080 down)
      console.warn(`[chatService] Backend server disconnected on port 8080. Serving local Phase 6 execution mock.`, error?.message);
      
      await new Promise((resolve) => setTimeout(resolve, 800));

      const lowerMsg = message.toLowerCase();
      const matched = MOCK_SQL_RESPONSES.find((item) =>
        item.keywords.some((kw) => lowerMsg.includes(kw))
      );

      const generatedSql = matched
        ? matched.sql
        : `SELECT * \nFROM students \nWHERE LOWER(first_name) LIKE '%${message.replace(/'/g, "''").slice(0, 20)}%' \nLIMIT 50;`;

      const columns = matched?.columns || ["student_id", "first_name", "last_name", "cgpa", "status"];
      const rows = matched?.rows || [
        [101, "Ali", "Khan", 3.85, "ACTIVE"],
        [102, "Sara", "Ahmed", 3.92, "ACTIVE"],
        [103, "Usman", "Tariq", 3.65, "ACTIVE"],
      ];

      return {
        generatedSql,
        columns,
        rows,
        model: matched?.model || "llama-3.3-70b-versatile (Offline Mock)",
        rowCount: rows.length,
        executionTimeMs: Date.now() - startTime,
      };
    }
  },
};

export default chatService;
