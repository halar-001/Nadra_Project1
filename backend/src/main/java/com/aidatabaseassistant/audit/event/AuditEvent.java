package com.aidatabaseassistant.audit.event;

import com.aidatabaseassistant.audit.model.EventType;
import com.aidatabaseassistant.audit.model.Severity;
import org.springframework.context.ApplicationEvent;

import java.util.UUID;

public class AuditEvent extends ApplicationEvent {

    private final Long userId;
    private final Long connectionId;
    private final UUID chatSessionId;
    private final EventType eventType;
    private final Severity severity;
    private final String description;
    private final String generatedSql;
    private final Long executionTimeMs;
    private final String provider;
    private final String ipAddress;
    private final String userAgent;

    // Builder pattern for easier construction
    public static class Builder {
        private Object source;
        private Long userId;
        private Long connectionId;
        private UUID chatSessionId;
        private EventType eventType;
        private Severity severity = Severity.INFO;
        private String description;
        private String generatedSql;
        private Long executionTimeMs;
        private String provider;
        private String ipAddress = "unknown";
        private String userAgent = "unknown";

        public Builder(Object source) {
            this.source = source;
        }

        public Builder userId(Long userId) { this.userId = userId; return this; }
        public Builder connectionId(Long connectionId) { this.connectionId = connectionId; return this; }
        public Builder chatSessionId(UUID chatSessionId) { this.chatSessionId = chatSessionId; return this; }
        public Builder eventType(EventType eventType) { this.eventType = eventType; return this; }
        public Builder severity(Severity severity) { this.severity = severity; return this; }
        public Builder description(String description) { this.description = description; return this; }
        public Builder generatedSql(String generatedSql) { this.generatedSql = generatedSql; return this; }
        public Builder executionTimeMs(Long executionTimeMs) { this.executionTimeMs = executionTimeMs; return this; }
        public Builder provider(String provider) { this.provider = provider; return this; }
        public Builder ipAddress(String ipAddress) { this.ipAddress = ipAddress; return this; }
        public Builder userAgent(String userAgent) { this.userAgent = userAgent; return this; }

        public AuditEvent build() {
            return new AuditEvent(this);
        }
    }

    private AuditEvent(Builder builder) {
        super(builder.source);
        this.userId = builder.userId;
        this.connectionId = builder.connectionId;
        this.chatSessionId = builder.chatSessionId;
        this.eventType = builder.eventType;
        this.severity = builder.severity;
        this.description = builder.description;
        this.generatedSql = builder.generatedSql;
        this.executionTimeMs = builder.executionTimeMs;
        this.provider = builder.provider;
        this.ipAddress = builder.ipAddress;
        this.userAgent = builder.userAgent;
    }

    public Long getUserId() { return userId; }
    public Long getConnectionId() { return connectionId; }
    public UUID getChatSessionId() { return chatSessionId; }
    public EventType getEventType() { return eventType; }
    public Severity getSeverity() { return severity; }
    public String getDescription() { return description; }
    public String getGeneratedSql() { return generatedSql; }
    public Long getExecutionTimeMs() { return executionTimeMs; }
    public String getProvider() { return provider; }
    public String getIpAddress() { return ipAddress; }
    public String getUserAgent() { return userAgent; }
}
