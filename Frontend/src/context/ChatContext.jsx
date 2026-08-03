import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import chatService from "../services/chatService";
import chatSessionService from "../services/chatSessionService";

const ChatContext = createContext();

export const MAX_MESSAGES_PER_SESSION = 40; // Policy Rule: Max 40 individual messages (20 User + 20 Assistant)
export const MAX_STORED_ROWS = 400; // Policy Rule: Max 400 stored rows in query result JSON

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionIdState] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Helper setter to sync activeSessionId with localStorage
  const setActiveSessionId = useCallback((id) => {
    setActiveSessionIdState(id);
    if (id) {
      localStorage.setItem("active_chat_session_id", String(id));
    } else {
      localStorage.removeItem("active_chat_session_id");
    }
  }, []);

  // 1. Load Initial Sessions on Mount
  useEffect(() => {
    const initSessions = async () => {
      try {
        const fetchedSessions = await chatSessionService.fetchSessions();
        if (fetchedSessions && fetchedSessions.length > 0) {
          setSessions(fetchedSessions);
          const savedActiveId = localStorage.getItem("active_chat_session_id");
          const foundSaved = fetchedSessions.find((s) => String(s.id) === String(savedActiveId));

          if (savedActiveId && foundSaved) {
            setActiveSessionId(foundSaved.id);
          } else {
            setActiveSessionId(fetchedSessions[0].id);
          }
        } else {
          // If empty, create default session
          const created = await chatSessionService.createSession("University Students & CGPA Analysis", 1);
          setSessions([created]);
          setActiveSessionId(created.id);
        }
      } catch (err) {
        console.error("[ChatContext] Failed to load sessions:", err);
      }
    };
    initSessions();
  }, [setActiveSessionId]);


  // 2. Load Session Messages when activeSessionId changes (Instant 0-Token History Viewing)
  useEffect(() => {
    if (!activeSessionId) return;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setErrorState(null);
      try {
        const historyMessages = await chatSessionService.fetchSessionMessages(activeSessionId);
        const normalized = (historyMessages || []).map((msg) => {
          let parsedResult = msg.queryResult;
          if (typeof parsedResult === "string" && parsedResult.trim()) {
            try {
              parsedResult = JSON.parse(parsedResult);
            } catch (e) {
              parsedResult = null;
            }
          }

          return {
            ...msg,
            sender: msg.role === "USER" ? "USER" : "AI",
            content: msg.message,
            columns: msg.columns || parsedResult?.columns || [],
            rows: msg.rows || parsedResult?.rows || [],
            rowCount: msg.rowCount ?? parsedResult?.rowCount ?? (parsedResult?.rows?.length || 0),
            executionTimeMs: msg.executionTimeMs || parsedResult?.metadata?.executionTimeMs || 42,
          };
        });
        setMessages(normalized);
      } catch (err) {
        console.error(`[ChatContext] Failed to load messages for session ${activeSessionId}:`, err);
        setMessages([]);
      } finally {
        setIsLoadingHistory(false);
      }
    };

    loadHistory();
  }, [activeSessionId]);

  /**
   * Helper: Add message with 40-message retention enforcement
   */
  const addMessageToState = useCallback((message) => {
    const newMessage = { id: String(Date.now()), createdAt: new Date().toISOString(), ...message };

    setMessages((prev) => {
      const updated = [...prev, newMessage];

      // Policy Enforcement: Max 40 messages per conversation
      if (updated.length > MAX_MESSAGES_PER_SESSION) {
        // Prune the oldest User + Assistant pair (first 2 messages)
        const pruned = updated.slice(2);
        console.log(`[ChatContext] Pruned oldest message pair to enforce ${MAX_MESSAGES_PER_SESSION}-message retention cap.`);
        return pruned;
      }

      return updated;
    });

    // Update messageCount in sessions list
    setSessions((prevSessions) =>
      prevSessions.map((s) =>
        s.id === activeSessionId
          ? {
              ...s,
              messageCount: Math.min(s.messageCount + 1, MAX_MESSAGES_PER_SESSION),
              lastMessageAt: new Date().toISOString(),
            }
          : s
      )
    );

    return newMessage;
  }, [activeSessionId]);

  /**
   * Send natural-language user prompt to Phase 7 AI Chat & Execution endpoint
   */
  const sendPrompt = async (promptText, connectionId) => {
    if (!promptText || !promptText.trim() || isGenerating) return;

    setErrorState(null);
    const userQuery = promptText.trim();

    // 1. Add User Message
    addMessageToState({
      sender: "USER",
      role: "USER",
      content: userQuery,
      message: userQuery,
      connectionId,
    });

    // Auto-rename session based on the first user prompt if title is default "New Chat Session"
    const currentSession = sessions.find((s) => s.id === activeSessionId);
    if (currentSession && (currentSession.title === "New Chat Session" || currentSession.title.startsWith("New Chat"))) {
      let autoTitle = userQuery.slice(0, 36).trim();
      if (userQuery.length > 36) autoTitle += "...";
      autoTitle = autoTitle.charAt(0).toUpperCase() + autoTitle.slice(1);
      renameSession(activeSessionId, autoTitle);
    }

    setIsGenerating(true);

    // Increment persistent user prompt counter in localStorage
    const currentPromptCount = Number(localStorage.getItem("user_ai_prompt_count") || 0) + 1;
    localStorage.setItem("user_ai_prompt_count", String(currentPromptCount));

    try {
      // 2. Call Chat & Execution Endpoint POST /api/chat
      const result = await chatService.postChatQuery(connectionId, userQuery, activeSessionId);

      // Increment persistent AI SQL count in localStorage
      const currentSqlCount = Number(localStorage.getItem("user_ai_sql_count") || 0) + 1;
      localStorage.setItem("user_ai_sql_count", String(currentSqlCount));

      // 3. Enforce 400-Row Storage Limit
      const rawRows = result.rows || [];
      const cappedRows = rawRows.length > MAX_STORED_ROWS ? rawRows.slice(0, MAX_STORED_ROWS) : rawRows;

      if (rawRows.length > MAX_STORED_ROWS) {
        console.log(`[ChatContext] Truncated query results from ${rawRows.length} to ${MAX_STORED_ROWS} rows for storage efficiency.`);
      }

      // 4. Add AI Generated & Executed SQL Message
      addMessageToState({
        sender: "AI",
        role: "ASSISTANT",
        content: `Executed SQL query for: "${userQuery}"`,
        message: `Executed SQL query for: "${userQuery}"`,
        generatedSql: result.generatedSql,
        columns: result.columns || [],
        rows: cappedRows,
        rowCount: result.rowCount ?? rawRows.length,
        model: result.model,
        executionTimeMs: result.executionTimeMs,
        connectionId,
      });

      // 5. Instantly sync backend-returned session UUID & refresh sessions list
      if (result.sessionId && String(result.sessionId) !== String(activeSessionId)) {
        setActiveSessionId(result.sessionId);
      }

      try {
        const freshSessions = await chatSessionService.fetchSessions();
        if (freshSessions && freshSessions.length > 0) {
          setSessions(freshSessions);
        }
      } catch (e) {
        // ignore background refresh errors
      }
    } catch (err) {
      console.error("[ChatContext] Chat Execution Error:", err);
      const errMsg = err?.message || "Failed to generate or execute SQL query.";
      setErrorState(errMsg);

      addMessageToState({
        sender: "AI",
        role: "ASSISTANT",
        isError: true,
        content: `⚠️ Error: ${errMsg}`,
        message: `⚠️ Error: ${errMsg}`,
        connectionId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Create a new chat session
   */
  const createNewSession = async (title = "New Chat Session", connectionId = null) => {
    try {
      const newSession = await chatSessionService.createSession(title, connectionId);
      if (newSession && newSession.id) {
        setSessions((prev) => {
          const exists = prev.some((s) => s.id === newSession.id);
          return exists ? prev : [newSession, ...prev];
        });
        setActiveSessionId(newSession.id);
        setMessages([]);
        setErrorState(null);
        return newSession;
      }
    } catch (err) {
      console.error("[ChatContext] Failed to create new session:", err);
    }
  };

  /**
   * Rename an existing chat session
   */
  const renameSession = async (sessionId, newTitle) => {
    if (!newTitle || !newTitle.trim()) return;
    try {
      await chatSessionService.renameSession(sessionId, newTitle.trim());
      setSessions((prev) =>
        prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle.trim() } : s))
      );
    } catch (err) {
      console.error(`[ChatContext] Failed to rename session ${sessionId}:`, err);
    }
  };

  /**
   * Delete a chat session
   */
  const deleteSession = async (sessionId) => {
    try {
      await chatSessionService.deleteSession(sessionId);
      setSessions((prev) => {
        const filtered = prev.filter((s) => s.id !== sessionId);
        if (activeSessionId === sessionId && filtered.length > 0) {
          setActiveSessionId(filtered[0].id);
        } else if (filtered.length === 0) {
          createNewSession("New Chat Session", 1);
        }
        return filtered;
      });
    } catch (err) {
      console.error(`[ChatContext] Failed to delete session ${sessionId}:`, err);
    }
  };

  /**
   * Clear all messages in current session
   */
  const clearMessages = () => {
    setMessages([]);
    setErrorState(null);
  };

  // Filtered Sessions List based on search term
  const filteredSessions = sessions.filter((s) =>
    s.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ChatContext.Provider
      value={{
        sessions: filteredSessions,
        allSessions: sessions,
        activeSessionId,
        setActiveSessionId,
        messages,
        searchTerm,
        setSearchTerm,
        isGenerating,
        isLoadingHistory,
        errorState,
        sendPrompt,
        createNewSession,
        renameSession,
        deleteSession,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
