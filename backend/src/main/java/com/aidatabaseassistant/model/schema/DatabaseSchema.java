package com.aidatabaseassistant.model.schema;

import java.util.ArrayList;
import java.util.List;

public class DatabaseSchema {
    private Long connectionId;
    private String databaseName;
    private String databaseType;
    private boolean fromCache;
    private List<TableMetadata> tables = new ArrayList<>();
    private List<RelationshipMetadata> relationships = new ArrayList<>();

    public DatabaseSchema() {
    }

    public DatabaseSchema(Long connectionId, String databaseName, String databaseType) {
        this.connectionId = connectionId;
        this.databaseName = databaseName;
        this.databaseType = databaseType;
        this.fromCache = false;
    }

    public DatabaseSchema(Long connectionId, String databaseName, String databaseType, boolean fromCache, 
                          List<TableMetadata> tables, List<RelationshipMetadata> relationships) {
        this.connectionId = connectionId;
        this.databaseName = databaseName;
        this.databaseType = databaseType;
        this.fromCache = fromCache;
        this.tables = tables != null ? tables : new ArrayList<>();
        this.relationships = relationships != null ? relationships : new ArrayList<>();
    }

    public void addTable(TableMetadata table) {
        this.tables.add(table);
    }

    public void addRelationship(RelationshipMetadata relationship) {
        this.relationships.add(relationship);
    }

    public TableMetadata findTable(String tableName) {
        for (TableMetadata table : tables) {
            if (table.getTableName().equalsIgnoreCase(tableName)) {
                return table;
            }
        }
        return null;
    }

    public Long getConnectionId() {
        return connectionId;
    }

    public void setConnectionId(Long connectionId) {
        this.connectionId = connectionId;
    }

    public String getDatabaseName() {
        return databaseName;
    }

    public void setDatabaseName(String databaseName) {
        this.databaseName = databaseName;
    }

    public String getDatabaseType() {
        return databaseType;
    }

    public void setDatabaseType(String databaseType) {
        this.databaseType = databaseType;
    }

    public boolean isFromCache() {
        return fromCache;
    }

    public void setFromCache(boolean fromCache) {
        this.fromCache = fromCache;
    }

    public List<TableMetadata> getTables() {
        return tables;
    }

    public void setTables(List<TableMetadata> tables) {
        this.tables = tables != null ? tables : new ArrayList<>();
    }

    public List<RelationshipMetadata> getRelationships() {
        return relationships;
    }

    public void setRelationships(List<RelationshipMetadata> relationships) {
        this.relationships = relationships != null ? relationships : new ArrayList<>();
    }

    @Override
    public String toString() {
        return "DatabaseSchema{" +
                "connectionId=" + connectionId +
                ", databaseName='" + databaseName + '\'' +
                ", databaseType='" + databaseType + '\'' +
                ", fromCache=" + fromCache +
                ", tables=" + tables.size() +
                ", relationships=" + relationships.size() +
                '}';
    }
}
