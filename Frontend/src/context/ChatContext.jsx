import React, { createContext, useContext, useState } from "react";
import chatService from "../services/chatService";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [sessions, setSessions] = useState([
    {
      id: 1,
      title: "Query Students & Departments",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [errorState, setErrorState] = useState(null);

  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "AI",
      content: "Hello! Ask me any database question in plain English. I will construct the schema-aware sanitized SQL query for you.",
      generatedSql: "SELECT s.student_id, s.name, s.cgpa\nFROM students s\nJOIN departments d ON s.department_id = d.department_id\nWHERE d.department_name = 'Computer Science'\n  AND s.cgpa > 3.5;",
      model: "gemini-1.5-flash",
      executionTimeMs: 812,
      createdAt: new Date().toISOString(),
    },
  ]);

  const addMessage = (message) => {
    const newMessage = { id: Date.now(), createdAt: new Date().toISOString(), ...message };
    setMessages((prev) => [...prev, newMessage]);
    return newMessage;
  };

  /**
   * Send natural-language user prompt to Phase 5 AI SQL Generator service
   */
  const sendPrompt = async (promptText, connectionId) => {
    if (!promptText || !promptText.trim()) return;

    setErrorState(null);
    const userQuery = promptText.trim();

    // 1. Add User Message
    addMessage({
      sender: "USER",
      content: userQuery,
      connectionId,
    });

    setIsGenerating(true);

    try {
      // 2. Call Phase 5 Chat Endpoint POST /api/chat
      const result = await chatService.postChatQuery(connectionId, userQuery);

      // 3. Add AI Generated SQL Message
      addMessage({
        sender: "AI",
        content: `Generated SQL query for: "${userQuery}"`,
        generatedSql: result.generatedSql,
        model: result.model,
        executionTimeMs: result.executionTimeMs,
        connectionId,
      });
    } catch (err) {
      console.error("Chat Error:", err);
      const errMsg = err?.message || "Failed to generate SQL query from AI provider.";
      setErrorState(errMsg);

      addMessage({
        sender: "AI",
        isError: true,
        content: `⚠️ Error: ${errMsg}`,
        connectionId,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const createNewSession = (title = "New Chat Session") => {
    const newSession = {
      id: Date.now(),
      title,
      createdAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newSession.id);
    setMessages([]);
    setErrorState(null);
  };

  const clearMessages = () => {
    setMessages([]);
    setErrorState(null);
  };

  return (
    <ChatContext.Provider
      value={{
        sessions,
        activeSessionId,
        setActiveSessionId,
        messages,
        isGenerating,
        errorState,
        addMessage,
        sendPrompt,
        createNewSession,
        clearMessages,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
