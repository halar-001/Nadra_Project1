package com.aidatabaseassistant.formatter.visualization;

import com.aidatabaseassistant.formatter.QueryResponse;
import java.util.Map;

public class ResultAnalyzer {
    
    public static class AnalysisResult {
        public int labelColumnIndex = -1;
        public int dataColumnIndex = -1;
        public String pattern = "UNKNOWN";
    }

    public AnalysisResult analyze(QueryResponse queryResponse, Map<Integer, DataProfiler.ColumnProfile> profiles) {
        AnalysisResult result = new AnalysisResult();
        
        if (profiles.size() < 2) {
            return result;
        }

        // Simple heuristic: First categorical/date column is X-axis (labels), First numeric is Y-axis (data)
        for (Map.Entry<Integer, DataProfiler.ColumnProfile> entry : profiles.entrySet()) {
            if (!entry.getValue().isNumeric && result.labelColumnIndex == -1) {
                result.labelColumnIndex = entry.getKey();
            } else if (entry.getValue().isNumeric && result.dataColumnIndex == -1) {
                result.dataColumnIndex = entry.getKey();
            }
        }
        
        // Fallback: if no categorical found, use first column as label, second as data
        if (result.labelColumnIndex == -1) {
            result.labelColumnIndex = 0;
            if (result.dataColumnIndex == 0) {
                result.dataColumnIndex = 1;
            }
        }
        if (result.dataColumnIndex == -1) {
            // Cannot chart without numeric data
            return result;
        }
        
        DataProfiler.ColumnProfile labelProfile = profiles.get(result.labelColumnIndex);
        if (labelProfile.isDate) {
            result.pattern = "Date + Numeric";
        } else {
            // Check for percentage
            String dataColName = profiles.get(result.dataColumnIndex).name.toLowerCase();
            if (dataColName.contains("percent") || dataColName.contains("ratio") || dataColName.contains("share")) {
                result.pattern = "Category + Percentage";
            } else {
                result.pattern = "Category + Numeric";
            }
        }
        return result;
    }
}
