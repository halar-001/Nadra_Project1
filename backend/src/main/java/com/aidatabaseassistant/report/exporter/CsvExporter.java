package com.aidatabaseassistant.report.exporter;

import com.aidatabaseassistant.report.dto.ReportDto;
import com.opencsv.CSVWriter;
import org.springframework.stereotype.Component;

import java.io.StringWriter;
import java.nio.charset.StandardCharsets;

@Component
public class CsvExporter {

    public byte[] export(ReportDto reportDto) {
        if (reportDto == null || reportDto.getTable() == null) {
            return new byte[0];
        }

        try (StringWriter sw = new StringWriter();
             CSVWriter writer = new CSVWriter(sw)) {
            
            // Write Header
            if (reportDto.getTable().getColumns() != null) {
                String[] header = reportDto.getTable().getColumns().toArray(new String[0]);
                writer.writeNext(header);
            }

            // Write Rows
            if (reportDto.getTable().getRows() != null) {
                for (java.util.List<Object> row : reportDto.getTable().getRows()) {
                    String[] stringRow = row.stream()
                            .map(obj -> obj != null ? obj.toString() : "")
                            .toArray(String[]::new);
                    writer.writeNext(stringRow);
                }
            }

            writer.flush();
            return sw.toString().getBytes(StandardCharsets.UTF_8);

        } catch (Exception e) {
            throw new RuntimeException("Error generating CSV report", e);
        }
    }
}
