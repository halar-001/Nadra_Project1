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
        
        if (profiles.isEmpty()) {
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
        
        // Fallback: if no numeric found, we can't chart
        if (result.dataColumnIndex == -1) {
            return result;
        }

        // Fallback: if no categorical found, use same numeric column for both or 0 and 1
        if (result.labelColumnIndex == -1) {
            if (profiles.size() == 1) {
                result.labelColumnIndex = result.dataColumnIndex;
            } else {
                result.labelColumnIndex = 0;
                if (result.dataColumnIndex == 0) {
                    result.dataColumnIndex = 1;
                }
            }
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
