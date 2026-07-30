package com.aidatabaseassistant.formatter;

import java.util.List;
import java.util.Map;

public class QueryResponse {
    private List<String> columns;
    private List<List<Object>> rows;
    private Map<String, Object> metadata;

    public QueryResponse() {}

    public QueryResponse(List<String> columns, List<List<Object>> rows, Map<String, Object> metadata) {
        this.columns = columns;
        this.rows = rows;
        this.metadata = metadata;
    }

    public List<String> getColumns() { return columns; }
    public void setColumns(List<String> columns) { this.columns = columns; }

    public List<List<Object>> getRows() { return rows; }
    public void setRows(List<List<Object>> rows) { this.rows = rows; }

    public Map<String, Object> getMetadata() { return metadata; }
    public void setMetadata(Map<String, Object> metadata) { this.metadata = metadata; }
}
