package com.aidatabaseassistant.formatter.visualization.dto;

import java.util.List;

public class VisualizationResponse {
    private String recommendedChart;
    private List<String> availableCharts;
    private ChartConfig config;

    public VisualizationResponse() {}

    public VisualizationResponse(String recommendedChart, List<String> availableCharts, ChartConfig config) {
        this.recommendedChart = recommendedChart;
        this.availableCharts = availableCharts;
        this.config = config;
    }

    public String getRecommendedChart() {
        return recommendedChart;
    }

    public void setRecommendedChart(String recommendedChart) {
        this.recommendedChart = recommendedChart;
    }

    public List<String> getAvailableCharts() {
        return availableCharts;
    }

    public void setAvailableCharts(List<String> availableCharts) {
        this.availableCharts = availableCharts;
    }

    public ChartConfig getConfig() {
        return config;
    }

    public void setConfig(ChartConfig config) {
        this.config = config;
    }
}
