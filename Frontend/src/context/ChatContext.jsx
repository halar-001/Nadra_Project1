import React, { createContext, useContext, useState } from "react";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const [activeConnection, setActiveConnection] = useState({
    id: 1,
    name: "Internal MySQL DB",
    dbType: "MYSQL",
    databaseName: "ai_db_assistant",
    host: "localhost",
    port: 3306,
  });

  const [sessions, setSessions] = useState([
    {
      id: 1,
      title: "Query Users & Roles Analytics",
      createdAt: new Date().toISOString(),
    },
  ]);

  const [activeSessionId, setActiveSessionId] = useState(1);
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "AI",
      content: "Hello! I am your AI Database Assistant. Connect a database and ask me queries in plain English.",
      sqlQuery: "SELECT * FROM users WHERE role = 'ADMIN';",
      queryResults: [
        { id: 1, username: "admin", email: "admin@aidatabaseassistant.com", role: "ADMIN" },
      ],
      createdAt: new Date().toISOString(),
    },
  ]);

  const addMessage = (message) => {
    setMessages((prev) => [...prev, { id: Date.now(), createdAt: new Date().toISOString(), ...message }]);
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
  };

  return (
    <ChatContext.Provider
      value={{
        activeConnection,
        setActiveConnection,
        sessions,
        activeSessionId,
        setActiveSessionId,
        messages,
        addMessage,
        createNewSession,
      }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);
