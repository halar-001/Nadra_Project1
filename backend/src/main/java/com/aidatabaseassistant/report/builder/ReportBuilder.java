package com.aidatabaseassistant.report.builder;

import com.aidatabaseassistant.dto.ChatResponse;
import com.aidatabaseassistant.report.dto.ReportDto;
import com.aidatabaseassistant.report.dto.ReportSummary;
import org.springframework.stereotype.Component;

@Component
public class ReportBuilder {

    public ReportDto buildFromChatResponse(ChatResponse response, String customTitle) {
        ReportDto report = new ReportDto();
        
        // Provide a default title if none is given
        report.setTitle(customTitle != null && !customTitle.trim().isEmpty() ? customTitle : "AI Database Assistant Report");
        
        int rows = response.getQueryResult() != null && response.getQueryResult().getRows() != null 
                ? response.getQueryResult().getRows().size() : 0;
                
        report.setSummary(new ReportSummary(rows, response.getExecutionTimeMs()));
        
        if (response.getQueryResult() != null) {
            report.setTable(new ReportDto.TableData(
                    response.getQueryResult().getColumns(),
                    response.getQueryResult().getRows()
            ));
        }

        report.setChart(response.getVisualization());
        report.setGeneratedSql(response.getGeneratedSql());
        
        return report;
    }
}
