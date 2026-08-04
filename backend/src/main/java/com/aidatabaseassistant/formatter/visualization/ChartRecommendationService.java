package com.aidatabaseassistant.formatter.visualization;

import java.util.Arrays;
import java.util.List;

public class ChartRecommendationService {

    public static class Recommendation {
        public String recommendedChart;
        public List<String> availableCharts;
        
        public Recommendation(String recommendedChart, List<String> availableCharts) {
            this.recommendedChart = recommendedChart;
            this.availableCharts = availableCharts;
        }
    }

    public Recommendation recommend(ResultAnalyzer.AnalysisResult analysis) {
        if (analysis.dataColumnIndex == -1) {
            return new Recommendation("TABLE", Arrays.asList("TABLE"));
        }

        switch (analysis.pattern) {
            case "Date + Numeric":
                return new Recommendation("LINE", Arrays.asList("LINE", "BAR", "TABLE"));
            case "Category + Percentage":
                return new Recommendation("PIE", Arrays.asList("PIE", "BAR", "TABLE"));
            case "Category + Numeric":
            default:
                return new Recommendation("BAR", Arrays.asList("BAR", "PIE", "LINE", "TABLE"));
        }
    }
}
