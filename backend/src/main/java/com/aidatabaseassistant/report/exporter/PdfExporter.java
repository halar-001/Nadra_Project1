package com.aidatabaseassistant.report.exporter;

import com.aidatabaseassistant.report.dto.ReportDto;
import com.lowagie.text.Document;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfWriter;
import org.springframework.stereotype.Component;

import java.io.ByteArrayOutputStream;
import java.util.List;

@Component
public class PdfExporter {

    public byte[] export(ReportDto reportDto) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document();
            PdfWriter.getInstance(document, baos);

            document.open();

            // Title
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 18);
            Paragraph title = new Paragraph(reportDto.getTitle() != null ? reportDto.getTitle() : "Report", titleFont);
            title.setAlignment(Paragraph.ALIGN_CENTER);
            title.setSpacingAfter(20f);
            document.add(title);

            // Summary
            if (reportDto.getSummary() != null) {
                Font summaryFont = FontFactory.getFont(FontFactory.HELVETICA, 12);
                Paragraph summary = new Paragraph(
                        "Total Rows: " + reportDto.getSummary().getRows() + "\n" +
                        "Execution Time: " + reportDto.getSummary().getExecutionTime() + " ms",
                        summaryFont
                );
                summary.setSpacingAfter(20f);
                document.add(summary);
            }

            // Table Data
            if (reportDto.getTable() != null && reportDto.getTable().getColumns() != null && !reportDto.getTable().getColumns().isEmpty()) {
                List<String> columns = reportDto.getTable().getColumns();
                PdfPTable table = new PdfPTable(columns.size());
                table.setWidthPercentage(100);

                Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10);
                for (String col : columns) {
                    PdfPCell cell = new PdfPCell(new Phrase(col, headerFont));
                    cell.setHorizontalAlignment(com.lowagie.text.Element.ALIGN_CENTER);
                    table.addCell(cell);
                }

                Font rowFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
                if (reportDto.getTable().getRows() != null) {
                    for (List<Object> row : reportDto.getTable().getRows()) {
                        for (Object cellData : row) {
                            table.addCell(new Phrase(cellData != null ? cellData.toString() : "", rowFont));
                        }
                    }
                }
                document.add(table);
            }

            // Generated SQL
            if (reportDto.getGeneratedSql() != null) {
                document.add(new Paragraph(" "));
                Font sqlFont = FontFactory.getFont(FontFactory.COURIER, 10);
                Paragraph sqlTitle = new Paragraph("Generated SQL:", FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12));
                sqlTitle.setSpacingAfter(5f);
                document.add(sqlTitle);
                
                Paragraph sql = new Paragraph(reportDto.getGeneratedSql(), sqlFont);
                document.add(sql);
            }

            document.close();
            return baos.toByteArray();

        } catch (Exception e) {
            throw new RuntimeException("Error generating PDF report", e);
        }
    }
}
