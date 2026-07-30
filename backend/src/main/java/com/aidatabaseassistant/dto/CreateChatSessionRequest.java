package com.aidatabaseassistant.dto;

import jakarta.validation.constraints.NotNull;

public class CreateChatSessionRequest {

    @NotNull(message = "Connection ID is required")
    private Long connectionId;

    private String title;

    public CreateChatSessionRequest() {
    }

    public CreateChatSessionRequest(Long connectionId, String title) {
        this.connectionId = connectionId;
        this.title = title;
    }

    public Long getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(Long connectionId) {
        this.connectionId = connectionId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }
}
