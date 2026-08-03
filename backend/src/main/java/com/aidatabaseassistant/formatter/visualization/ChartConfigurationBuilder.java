package com.aidatabaseassistant.formatter.visualization;

import com.aidatabaseassistant.formatter.QueryResponse;
import com.aidatabaseassistant.formatter.visualization.dto.ChartConfig;
import com.aidatabaseassistant.formatter.visualization.dto.DatasetInfo;
import java.util.ArrayList;
import java.util.List;

public class ChartConfigurationBuilder {

    public ChartConfig build(QueryResponse queryResponse, ResultAnalyzer.AnalysisResult analysis) {
        if (analysis.dataColumnIndex == -1 || analysis.labelColumnIndex == -1) {
            return null; // Cannot build chart config
        }

        List<String> columns = queryResponse.getColumns();
        List<List<Object>> rows = queryResponse.getRows();

        String xAxis = columns.get(analysis.labelColumnIndex);
        String yAxis = columns.get(analysis.dataColumnIndex);
        String title = yAxis + " by " + xAxis;

        List<String> labels = new ArrayList<>();
        List<Number> data = new ArrayList<>();

        for (List<Object> row : rows) {
            if (row.size() > Math.max(analysis.labelColumnIndex, analysis.dataColumnIndex)) {
                Object labelObj = row.get(analysis.labelColumnIndex);
                labels.add(labelObj != null ? labelObj.toString() : "Unknown");

                Object dataObj = row.get(analysis.dataColumnIndex);
                if (dataObj instanceof Number) {
                    data.add((Number) dataObj);
                } else if (dataObj != null) {
                    try {
                        data.add(Double.parseDouble(dataObj.toString()));
                    } catch (NumberFormatException e) {
                        data.add(0);
                    }
                } else {
                    data.add(0);
                }
            }
        }

        List<DatasetInfo> datasets = new ArrayList<>();
        datasets.add(new DatasetInfo(yAxis, data));

        return new ChartConfig(title, xAxis, yAxis, labels, datasets);
    }
}
