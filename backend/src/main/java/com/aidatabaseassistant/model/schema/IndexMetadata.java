package com.aidatabaseassistant.model.schema;

public class IndexMetadata {
    private String indexName;
    private String columnName;
    private boolean nonUnique;

    public IndexMetadata() {
    }

    public IndexMetadata(String indexName, String columnName, boolean nonUnique) {
        this.indexName = indexName;
        this.columnName = columnName;
        this.nonUnique = nonUnique;
    }

    public String getIndexName() {
        return indexName;
    }

    public void setIndexName(String indexName) {
        this.indexName = indexName;
    }

    public String getColumnName() {
        return columnName;
    }

    public void setColumnName(String columnName) {
        this.columnName = columnName;
    }

    public boolean isNonUnique() {
        return nonUnique;
    }

    public void setNonUnique(boolean nonUnique) {
        this.nonUnique = nonUnique;
    }

    @Override
    public String toString() {
        return "IndexMetadata{" +
                "indexName='" + indexName + '\'' +
                ", columnName='" + columnName + '\'' +
                ", nonUnique=" + nonUnique +
                '}';
    }
}
