package com.aidatabaseassistant.report.dto;

import com.aidatabaseassistant.formatter.visualization.dto.VisualizationResponse;
import java.util.List;

public class ReportDto {
    private String title;
    private ReportSummary summary;
    private TableData table;
    private VisualizationResponse chart;
    private String generatedSql;

    public ReportDto() {}

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public ReportSummary getSummary() { return summary; }
    public void setSummary(ReportSummary summary) { this.summary = summary; }

    public TableData getTable() { return table; }
    public void setTable(TableData table) { this.table = table; }

    public VisualizationResponse getChart() { return chart; }
    public void setChart(VisualizationResponse chart) { this.chart = chart; }

    public String getGeneratedSql() { return generatedSql; }
    public void setGeneratedSql(String generatedSql) { this.generatedSql = generatedSql; }

    public static class TableData {
        private List<String> columns;
        private List<List<Object>> rows;

        public TableData() {}
        public TableData(List<String> columns, List<List<Object>> rows) {
            this.columns = columns;
            this.rows = rows;
        }

        public List<String> getColumns() { return columns; }
        public void setColumns(List<String> columns) { this.columns = columns; }
        public List<List<Object>> getRows() { return rows; }
        public void setRows(List<List<Object>> rows) { this.rows = rows; }
    }
}
