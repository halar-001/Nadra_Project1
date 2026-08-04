package com.aidatabaseassistant.formatter.visualization.dto;

import java.util.List;

public class ChartConfig {
    private String title;
    private String xAxis;
    private String yAxis;
    private List<String> labels;
    private List<DatasetInfo> datasets;

    public ChartConfig() {}

    public ChartConfig(String title, String xAxis, String yAxis, List<String> labels, List<DatasetInfo> datasets) {
        this.title = title;
        this.xAxis = xAxis;
        this.yAxis = yAxis;
        this.labels = labels;
        this.datasets = datasets;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getxAxis() {
        return xAxis;
    }

    public void setxAxis(String xAxis) {
        this.xAxis = xAxis;
    }

    public String getyAxis() {
        return yAxis;
    }

    public void setyAxis(String yAxis) {
        this.yAxis = yAxis;
    }

    public List<String> getLabels() {
        return labels;
    }

    public void setLabels(List<String> labels) {
        this.labels = labels;
    }

    public List<DatasetInfo> getDatasets() {
        return datasets;
    }

    public void setDatasets(List<DatasetInfo> datasets) {
        this.datasets = datasets;
    }
}
