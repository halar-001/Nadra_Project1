import api from "./api";

// Offline Mock SQL Generation mapping for testing when API is offline
const MOCK_SQL_RESPONSES = [
  {
    keywords: ["computer science", "cgpa", "3.5", "students"],
    sql: `SELECT s.student_id, s.name, s.cgpa\nFROM students s\nJOIN departments d ON s.department_id = d.department_id\nWHERE d.department_name = 'Computer Science'\n  AND s.cgpa > 3.5;`,
    model: "gemini-1.5-flash",
  },
  {
    keywords: ["ali", "firstname", "name"],
    sql: `SELECT student_id, registration_no, first_name, last_name, email\nFROM students\nWHERE first_name = 'Ali';`,
    model: "gemini-1.5-flash",
  },
  {
    keywords: ["department", "building", "head"],
    sql: `SELECT department_id, department_name, building_code, head_of_department\nFROM departments\nORDER BY department_name ASC;`,
    model: "groq-llama-3.3-70b",
  },
  {
    keywords: ["course", "credit", "hours"],
    sql: `SELECT c.course_code, c.course_title, c.credit_hours, d.department_name\nFROM courses c\nJOIN departments d ON c.department_id = d.department_id\nWHERE c.credit_hours >= 3;`,
    model: "gemini-1.5-flash",
  },
];

export const chatService = {
  /**
   * Sends user natural-language prompt to backend Phase 5 AI Chat endpoint.
   * Calls POST /api/chat
   * Payload: { connectionId, message }
   * Returns: { generatedSql, model, executionTimeMs }
   */
  postChatQuery: async (connectionId, message) => {
    const startTime = Date.now();
    try {
      const response = await api.post("/chat", {
        connectionId: Number(connectionId),
        message: message.trim(),
      });

      const payload = response.data;
      const data = payload?.data || payload;

      return {
        generatedSql: data.generatedSql || data.sql || "SELECT * FROM dual;",
        model: data.model || "gemini-1.5-flash",
        executionTimeMs: data.executionTimeMs || (Date.now() - startTime),
      };
    } catch (error) {
      // If backend returned an HTTP error response (e.g. 500, 400, 404), throw error to display Error Banner
      if (error.response) {
        const backendMessage =
          error.response?.data?.message ||
          error.response?.data?.error ||
          error.response?.data?.data ||
          "AI Provider failed to generate SQL. Please check your API keys or internet connection.";
        throw new Error(backendMessage);
      }

      // ONLY use offline mock generator if Backend Server is completely disconnected (Network Error / Port 8080 down)
      console.warn(`[chatService] Backend server disconnected on port 8080. Serving local mock fallback.`, error?.message);
      
      // Simulate realistic processing latency
      await new Promise((resolve) => setTimeout(resolve, 800));

      const lowerMsg = message.toLowerCase();
      const matched = MOCK_SQL_RESPONSES.find((item) =>
        item.keywords.some((kw) => lowerMsg.includes(kw))
      );

      const generatedSql = matched
        ? matched.sql
        : `SELECT * \nFROM students \nWHERE LOWER(first_name) LIKE '%${message.replace(/'/g, "''").slice(0, 20)}%' \nLIMIT 50;`;

      return {
        generatedSql,
        model: "Offline Mock (Server Disconnected)",
        executionTimeMs: Date.now() - startTime,
      };
    }
  },
};

export default chatService;
