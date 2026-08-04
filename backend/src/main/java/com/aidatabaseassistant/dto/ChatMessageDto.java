package com.aidatabaseassistant.dto;

import com.aidatabaseassistant.entity.ChatRole;
import com.fasterxml.jackson.annotation.JsonRawValue;

import java.time.LocalDateTime;
import java.util.UUID;

public class ChatMessageDto {
    private Long id;
    private ChatRole role;
    private String message;
    private String generatedSql;
    private String validatedSql;
    
    @JsonRawValue
    private String queryResult;
    
    private Integer rowCount;
    private Long executionTimeMs;
    private LocalDateTime createdAt;

    public ChatMessageDto() {
    }

    public ChatMessageDto(Long id, ChatRole role, String message, String generatedSql, String validatedSql, String queryResult, Integer rowCount, Long executionTimeMs, LocalDateTime createdAt) {
        this.id = id;
        this.role = role;
        this.message = message;
        this.generatedSql = generatedSql;
        this.validatedSql = validatedSql;
        this.queryResult = queryResult;
        this.rowCount = rowCount;
        this.executionTimeMs = executionTimeMs;
        this.createdAt = createdAt;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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
}
