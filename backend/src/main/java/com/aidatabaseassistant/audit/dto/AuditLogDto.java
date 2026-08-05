package com.aidatabaseassistant.audit.dto;

import com.aidatabaseassistant.audit.enums.AuditEventType;
import com.aidatabaseassistant.audit.enums.Severity;
import com.aidatabaseassistant.audit.enums.Severity;

import java.time.LocalDateTime;
import java.util.UUID;

public class AuditLogDto {
    private Long id;
    private Long userId;
    private Long connectionId;
    private UUID chatSessionId;
    private AuditEventType eventType;
    private Severity severity;
    private String description;
    private String provider;
    private Integer executionTimeMs;
    private LocalDateTime createdAt;
    private String userName;

    public AuditLogDto() {}

    public AuditLogDto(Long id, Long userId, Long connectionId, UUID chatSessionId, AuditEventType eventType, Severity severity, String description, String provider, Integer executionTimeMs, LocalDateTime createdAt, String userName) {
        this.id = id;
        this.userId = userId;
        this.connectionId = connectionId;
        this.chatSessionId = chatSessionId;
        this.eventType = eventType;
        this.severity = severity;
        this.description = description;
        this.provider = provider;
        this.executionTimeMs = executionTimeMs;
        this.createdAt = createdAt;
        this.userName = userName;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    public Long getConnectionId() { return connectionId; }
    public void setConnectionId(Long connectionId) { this.connectionId = connectionId; }
    public UUID getChatSessionId() { return chatSessionId; }
    public void setChatSessionId(UUID chatSessionId) { this.chatSessionId = chatSessionId; }
    public AuditEventType getEventType() { return eventType; }
    public void setEventType(AuditEventType eventType) { this.eventType = eventType; }
    public Severity getSeverity() { return severity; }
    public void setSeverity(Severity severity) { this.severity = severity; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getProvider() { return provider; }
    public void setProvider(String provider) { this.provider = provider; }
    public Integer getExecutionTimeMs() { return executionTimeMs; }
    public void setExecutionTimeMs(Integer executionTimeMs) { this.executionTimeMs = executionTimeMs; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    public String getUserName() { return userName; }
    public void setUserName(String userName) { this.userName = userName; }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private Long id;
        private Long userId;
        private Long connectionId;
        private UUID chatSessionId;
        private AuditEventType eventType;
        private Severity severity;
        private String description;
        private String provider;
        private Integer executionTimeMs;
        private LocalDateTime createdAt;
        private String userName;

        public Builder id(Long id) { this.id = id; return this; }
        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder connectionId(Long connectionId) { this.connectionId = connectionId; return this; }
        public Builder chatSessionId(UUID chatSessionId) { this.chatSessionId = chatSessionId; return this; }
        public Builder eventType(AuditEventType eventType) { this.eventType = eventType; return this; }
        public Builder severity(Severity severity) { this.severity = severity; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder provider(String provider) { this.provider = provider; return this; }
        public Builder executionTimeMs(Integer executionTimeMs) { this.executionTimeMs = executionTimeMs; return this; }
        public Builder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }
        public Builder userName(String userName) { this.userName = userName; return this; }

        public AuditLogDto build() {
            return new AuditLogDto(id, userId, connectionId, chatSessionId, eventType, severity, description, provider, executionTimeMs, createdAt, userName);
        }
    }
}
