package com.aidatabaseassistant.model.schema;

import java.util.ArrayList;
import java.util.List;

public class TableMetadata {
    private String tableName;
    private String tableType;
    private List<ColumnMetadata> columns = new ArrayList<>();
    private List<String> primaryKeys = new ArrayList<>();
    private List<IndexMetadata> indexes = new ArrayList<>();

    public TableMetadata() {
    }

    public TableMetadata(String tableName, String tableType) {
        this.tableName = tableName;
        this.tableType = tableType;
    }

    public TableMetadata(String tableName, String tableType, List<ColumnMetadata> columns, List<String> primaryKeys, List<IndexMetadata> indexes) {
        this.tableName = tableName;
        this.tableType = tableType;
        this.columns = columns != null ? columns : new ArrayList<>();
        this.primaryKeys = primaryKeys != null ? primaryKeys : new ArrayList<>();
        this.indexes = indexes != null ? indexes : new ArrayList<>();
    }

    public void addColumn(ColumnMetadata column) {
        this.columns.add(column);
    }

    public void addPrimaryKey(String primaryKey) {
        if (!this.primaryKeys.contains(primaryKey)) {
            this.primaryKeys.add(primaryKey);
        }
    }

    public void addIndex(IndexMetadata index) {
        this.indexes.add(index);
    }

    public String getTableName() {
        return tableName;
    }

    public void setTableName(String tableName) {
        this.tableName = tableName;
    }

    public String getTableType() {
        return tableType;
    }

    public void setTableType(String tableType) {
        this.tableType = tableType;
    }

    public List<ColumnMetadata> getColumns() {
        return columns;
    }

    public void setColumns(List<ColumnMetadata> columns) {
        this.columns = columns != null ? columns : new ArrayList<>();
    }

    public List<String> getPrimaryKeys() {
        return primaryKeys;
    }

    public void setPrimaryKeys(List<String> primaryKeys) {
        this.primaryKeys = primaryKeys != null ? primaryKeys : new ArrayList<>();
    }

    public List<IndexMetadata> getIndexes() {
        return indexes;
    }

    public void setIndexes(List<IndexMetadata> indexes) {
        this.indexes = indexes != null ? indexes : new ArrayList<>();
    }

    @Override
    public String toString() {
        return "TableMetadata{" +
                "tableName='" + tableName + '\'' +
                ", tableType='" + tableType + '\'' +
                ", columns=" + columns.size() +
                ", primaryKeys=" + primaryKeys +
                ", indexes=" + indexes.size() +
                '}';
    }
}
