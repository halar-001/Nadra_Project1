import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import chatService from "../services/chatService";
import chatSessionService from "../services/chatSessionService";

const ChatContext = createContext();

export const MAX_MESSAGES_PER_SESSION = 40; // Policy Rule: Max 40 individual messages (20 User + 20 Assistant)
export const MAX_STORED_ROWS = 400; // Policy Rule: Max 400 stored rows in query result JSON

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorState, setErrorState] = useState(null);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // 1. Load Initial Sessions on Mount
  useEffect(() => {
    const initSessions = async () => {
      try {
        const fetchedSessions = await chatSessionService.fetchSessions();
        if (fetchedSessions && fetchedSessions.length > 0) {
          setSessions(fetchedSessions);
          setActiveSessionId(fetchedSessions[0].id);
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
  }, []);

  // 2. Load Session Messages when activeSessionId changes (Instant 0-Token History Viewing)
  useEffect(() => {
    if (!activeSessionId) return;

    const loadHistory = async () => {
      setIsLoadingHistory(true);
      setErrorState(null);
      try {
        const historyMessages = await chatSessionService.fetchSessionMessages(activeSessionId);
        setMessages(historyMessages || []);
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

    setIsGenerating(true);

    try {
      // 2. Call Chat & Execution Endpoint POST /api/chat
      const result = await chatService.postChatQuery(connectionId, userQuery);

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
  const createNewSession = async (title = "New Chat Session", connectionId = 1) => {
    try {
      const newSession = await chatSessionService.createSession(title, connectionId);
      setSessions((prev) => [newSession, ...prev]);
      setActiveSessionId(newSession.id);
      setMessages([]);
      setErrorState(null);
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
