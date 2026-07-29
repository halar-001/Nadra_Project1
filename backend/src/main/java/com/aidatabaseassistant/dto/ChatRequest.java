package com.aidatabaseassistant.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public class ChatRequest {

    @NotNull(message = "Connection ID is required")
    private Long connectionId;

    @NotBlank(message = "Message cannot be empty")
    private String message;

    public ChatRequest() {
    }

    public ChatRequest(Long connectionId, String message) {
        this.connectionId = connectionId;
        this.message = message;
    }

    public Long getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(Long connectionId) {
        this.connectionId = connectionId;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }
}
