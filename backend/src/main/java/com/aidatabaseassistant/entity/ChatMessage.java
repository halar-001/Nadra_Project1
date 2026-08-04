package com.aidatabaseassistant.entity;

import jakarta.persistence.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "chat_messages")
public class ChatMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    private ChatSession chatSession;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ChatRole role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String message;

    @Column(name = "generated_sql", columnDefinition = "LONGTEXT")
    private String generatedSql;

    @Column(name = "validated_sql", columnDefinition = "LONGTEXT")
    private String validatedSql;

    @Column(name = "query_result", columnDefinition = "JSON")
    private String queryResult;

    @Column(name = "row_count")
    private Integer rowCount;

    @Column(name = "execution_time_ms")
    private Long executionTimeMs;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    public ChatMessage() {
    }

    public UUID getId() {
        return id;
    }

    public void setId(UUID id) {
        this.id = id;
    }

    public ChatSession getChatSession() {
        return chatSession;
    }

    public void setChatSession(ChatSession chatSession) {
        this.chatSession = chatSession;
    }

    public ChatRole getRole() {
        return role;
    }

    public void setRole(ChatRole role) {
        this.role = role;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getGeneratedSql() {
        return generatedSql;
    }

    public void setGeneratedSql(String generatedSql) {
        this.generatedSql = generatedSql;
    }

    public String getValidatedSql() {
        return validatedSql;
    }

    public void setValidatedSql(String validatedSql) {
        this.validatedSql = validatedSql;
    }

    public String getQueryResult() {
        return queryResult;
    }

    public void setQueryResult(String queryResult) {
        this.queryResult = queryResult;
    }

    public Integer getRowCount() {
        return rowCount;
    }

    public void setRowCount(Integer rowCount) {
        this.rowCount = rowCount;
    }

    public Long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(Long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private ChatSession chatSession;
        private ChatRole role;
        private String message;
        private String generatedSql;
        private String validatedSql;
        private String queryResult;
        private Integer rowCount;
        private Long executionTimeMs;

        public Builder chatSession(ChatSession chatSession) {
            this.chatSession = chatSession;
            return this;
        }

        public Builder role(ChatRole role) {
            this.role = role;
            return this;
        }

        public Builder message(String message) {
            this.message = message;
            return this;
        }

        public Builder generatedSql(String generatedSql) {
            this.generatedSql = generatedSql;
            return this;
        }

        public Builder validatedSql(String validatedSql) {
            this.validatedSql = validatedSql;
            return this;
        }

        public Builder queryResult(String queryResult) {
            this.queryResult = queryResult;
            return this;
        }

        public Builder rowCount(Integer rowCount) {
            this.rowCount = rowCount;
            return this;
        }

        public Builder executionTimeMs(Long executionTimeMs) {
            this.executionTimeMs = executionTimeMs;
            return this;
        }

        public ChatMessage build() {
            ChatMessage chatMessage = new ChatMessage();
            chatMessage.setChatSession(this.chatSession);
            chatMessage.setRole(this.role);
            chatMessage.setMessage(this.message);
            chatMessage.setGeneratedSql(this.generatedSql);
            chatMessage.setValidatedSql(this.validatedSql);
            chatMessage.setQueryResult(this.queryResult);
            chatMessage.setRowCount(this.rowCount);
            chatMessage.setExecutionTimeMs(this.executionTimeMs);
            return chatMessage;
        }
    }
}
