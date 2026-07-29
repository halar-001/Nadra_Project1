package com.aidatabaseassistant.dto;

public class ChatResponse {
    
    private String generatedSql;
    private String model;
    private long executionTimeMs;

    public ChatResponse() {
    }

    public ChatResponse(String generatedSql, String model, long executionTimeMs) {
        this.generatedSql = generatedSql;
        this.model = model;
        this.executionTimeMs = executionTimeMs;
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
}
