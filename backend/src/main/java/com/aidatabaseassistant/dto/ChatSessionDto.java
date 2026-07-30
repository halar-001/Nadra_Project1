package com.aidatabaseassistant.dto;

import com.aidatabaseassistant.entity.ChatSessionStatus;

import java.time.LocalDateTime;
import java.util.UUID;

public class ChatSessionDto {
    private UUID id;
    private Long connectionId;
    private String title;
    private int messageCount;
    private ChatSessionStatus status;
    private LocalDateTime lastMessageAt;

    public ChatSessionDto() {
    }

    public ChatSessionDto(UUID id, Long connectionId, String title, int messageCount, ChatSessionStatus status, LocalDateTime lastMessageAt) {
        this.id = id;
        this.connectionId = connectionId;
        this.title = title;
        this.messageCount = messageCount;
        this.status = status;
        this.lastMessageAt = lastMessageAt;
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
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

    public int getMessageCount() {
        return messageCount;
    }

    public void setMessageCount(int messageCount) {
        this.messageCount = messageCount;
    }

    public ChatSessionStatus getStatus() {
        return status;
    }

    public void setStatus(ChatSessionStatus status) {
        this.status = status;
    }

    public LocalDateTime getLastMessageAt() {
        return lastMessageAt;
    }

    public void setLastMessageAt(LocalDateTime lastMessageAt) {
        this.lastMessageAt = lastMessageAt;
    }
}
