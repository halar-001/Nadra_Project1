package com.aidatabaseassistant.dto;

import jakarta.validation.constraints.NotBlank;

public class SchemaSelectRequest {
    @NotBlank(message = "Query prompt cannot be empty")
    private String query;

    public SchemaSelectRequest() {
    }

    public SchemaSelectRequest(String query) {
        this.query = query;
    }

    public String getQuery() {
        return query;
    }

    public void setQuery(String query) {
        this.query = query;
    }
}
