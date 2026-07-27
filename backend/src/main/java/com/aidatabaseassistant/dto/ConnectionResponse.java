package com.aidatabaseassistant.dto;

import com.aidatabaseassistant.entity.DatabaseConnection;

import java.time.LocalDateTime;

public class ConnectionResponse {

    private Long id;
    private String connectionName;
    private String databaseType;
    private String host;
    private int port;
    private String databaseName;
    private String username;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ConnectionResponse() {
    }

    public ConnectionResponse(Long id, String connectionName, String databaseType, String host, int port, String databaseName, String username, LocalDateTime createdAt, LocalDateTime updatedAt) {
        this.id = id;
        this.connectionName = connectionName;
        this.databaseType = databaseType;
        this.host = host;
        this.port = port;
        this.databaseName = databaseName;
        this.username = username;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public static ConnectionResponse fromEntity(DatabaseConnection entity) {
        if (entity == null) {
            return null;
        }
        return new ConnectionResponse(
                entity.getId(),
                entity.getConnectionName(),
                entity.getDatabaseType(),
                entity.getHost(),
                entity.getPort(),
                entity.getDatabaseName(),
                entity.getUsername(),
                entity.getCreatedAt(),
                entity.getUpdatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getConnectionName() {
        return connectionName;
    }

    public void setConnectionName(String connectionName) {
        this.connectionName = connectionName;
    }

    public String getDatabaseType() {
        return databaseType;
    }

    public void setDatabaseType(String databaseType) {
        this.databaseType = databaseType;
    }

    public String getHost() {
        return host;
    }

    public void setHost(String host) {
        this.host = host;
    }

    public int getPort() {
        return port;
    }

    public void setPort(int port) {
        this.port = port;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
