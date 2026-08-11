package com.aidatabaseassistant.formatter;

import com.aidatabaseassistant.formatter.visualization.ChartConfigurationBuilder;
import com.aidatabaseassistant.formatter.visualization.ChartRecommendationService;
import com.aidatabaseassistant.formatter.visualization.DataProfiler;
import com.aidatabaseassistant.formatter.visualization.ResultAnalyzer;
import com.aidatabaseassistant.formatter.visualization.dto.ChartConfig;
import com.aidatabaseassistant.formatter.visualization.dto.VisualizationResponse;
import org.springframework.stereotype.Service;

import java.util.Map;

@Service
public class ResponseFormatter {

    private final DataProfiler dataProfiler;
    private final ResultAnalyzer resultAnalyzer;
    private final ChartRecommendationService chartRecommendationService;
    private final ChartConfigurationBuilder chartConfigurationBuilder;

    public ResponseFormatter() {
        this.dataProfiler = new DataProfiler();
        this.resultAnalyzer = new ResultAnalyzer();
        this.chartRecommendationService = new ChartRecommendationService();
        this.chartConfigurationBuilder = new ChartConfigurationBuilder();
    }

    public VisualizationResponse buildVisualization(QueryResponse queryResponse) {
        if (queryResponse == null || queryResponse.getRows() == null || queryResponse.getRows().isEmpty()) {
            return null;
        }

        // 1. Profile Data
        Map<Integer, DataProfiler.ColumnProfile> profiles = dataProfiler.profile(queryResponse);

        // 2. Analyze Result Pattern
        ResultAnalyzer.AnalysisResult analysis = resultAnalyzer.analyze(queryResponse, profiles);

        // 3. Recommend Chart
        ChartRecommendationService.Recommendation recommendation = chartRecommendationService.recommend(analysis);

        if ("TABLE".equals(recommendation.recommendedChart)) {
            return null; // No visualization needed/possible
        }

        // 4. Build Configuration
        ChartConfig config = chartConfigurationBuilder.build(queryResponse, analysis);

        if (config == null) {
            return null;
        }

        return new VisualizationResponse(recommendation.recommendedChart, recommendation.availableCharts, config);
    }
}
