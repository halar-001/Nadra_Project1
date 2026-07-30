package com.aidatabaseassistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatRequest {

    @NotNull(message = "Session ID is required")
    private java.util.UUID sessionId;

    @NotBlank(message = "Message cannot be empty")
    private String message;

    public ChatRequest() {
    }

    public ChatRequest(java.util.UUID sessionId, String message) {
        this.sessionId = sessionId;
        this.message = message;
    }

    public java.util.UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(java.util.UUID sessionId) {
        this.sessionId = sessionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
