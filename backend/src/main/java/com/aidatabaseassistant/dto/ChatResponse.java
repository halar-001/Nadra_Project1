package com.aidatabaseassistant.dto;

import com.aidatabaseassistant.formatter.QueryResponse;

public class ChatResponse {
    
    private java.util.UUID sessionId;
    private String generatedSql;
    private String model;
    private long executionTimeMs;
    private QueryResponse queryResult;

    public ChatResponse() {
    }

    public ChatResponse(java.util.UUID sessionId, String generatedSql, String model, long executionTimeMs, QueryResponse queryResult) {
        this.sessionId = sessionId;
        this.generatedSql = generatedSql;
        this.model = model;
        this.executionTimeMs = executionTimeMs;
        this.queryResult = queryResult;
    }

    public java.util.UUID getSessionId() {
        return sessionId;
    }

    public void setSessionId(java.util.UUID sessionId) {
        this.sessionId = sessionId;
    }

    public String getGeneratedSql() {
        return generatedSql;
    }

    public void setGeneratedSql(String generatedSql) {
        this.generatedSql = generatedSql;
    }

    public String getModel() {
        return model;
    }

    public void setModel(String model) {
        this.model = model;
    }

    public long getExecutionTimeMs() {
        return executionTimeMs;
    }

    public void setExecutionTimeMs(long executionTimeMs) {
        this.executionTimeMs = executionTimeMs;
    }

    public QueryResponse getQueryResult() {
        return queryResult;
    }

    public void setQueryResult(QueryResponse queryResult) {
        this.queryResult = queryResult;
    }
}
