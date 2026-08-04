package com.aidatabaseassistant.dto;

import com.aidatabaseassistant.formatter.QueryResponse;

public class ChatResponse {
    
    private java.util.UUID sessionId;
    private String generatedSql;
    private String model;
    private long executionTimeMs;
    private QueryResponse queryResult;
    private com.aidatabaseassistant.formatter.visualization.dto.VisualizationResponse visualization;

    public ChatResponse() {
    }

    public ChatResponse(java.util.UUID sessionId, String generatedSql, String model, long executionTimeMs, QueryResponse queryResult, com.aidatabaseassistant.formatter.visualization.dto.VisualizationResponse visualization) {
        this.sessionId = sessionId;
        this.generatedSql = generatedSql;
        this.model = model;
        this.executionTimeMs = executionTimeMs;
        this.queryResult = queryResult;
        this.visualization = visualization;
    }

    public ChatResponse(java.util.UUID sessionId, String generatedSql, String model, long executionTimeMs, QueryResponse queryResult) {
        this(sessionId, generatedSql, model, executionTimeMs, queryResult, null);
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

    public com.aidatabaseassistant.formatter.visualization.dto.VisualizationResponse getVisualization() {
        return visualization;
    }

    public void setVisualization(com.aidatabaseassistant.formatter.visualization.dto.VisualizationResponse visualization) {
        this.visualization = visualization;
    }
}
