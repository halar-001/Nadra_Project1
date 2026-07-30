import React from "react";
import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { ConnectionProvider } from "./context/ConnectionContext";
import { SchemaProvider } from "./context/SchemaContext";
import { ChatProvider } from "./context/ChatContext";
import AppRoutes from "./routes/AppRoutes";
import "./index.css";

function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <ConnectionProvider>
            <SchemaProvider>
              <ChatProvider>
                <AppRoutes />
              </ChatProvider>
            </SchemaProvider>
          </ConnectionProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}

export default App;
