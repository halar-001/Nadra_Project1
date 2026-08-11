package com.aidatabaseassistant.report.dto;

public class ReportSummary {
    private int rows;
    private long executionTime;

    public ReportSummary() {}

    public ReportSummary(int rows, long executionTime) {
        this.rows = rows;
        this.executionTime = executionTime;
    }

    public int getRows() { return rows; }
    public void setRows(int rows) { this.rows = rows; }

    public long getExecutionTime() { return executionTime; }
    public void setExecutionTime(long executionTime) { this.executionTime = executionTime; }
}
