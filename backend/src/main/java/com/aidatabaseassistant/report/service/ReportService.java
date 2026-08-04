package com.aidatabaseassistant.report.service;

import com.aidatabaseassistant.audit.event.AuditEvent;
import com.aidatabaseassistant.audit.model.EventType;
import com.aidatabaseassistant.audit.model.Severity;
import com.aidatabaseassistant.report.dto.ReportDto;
import com.aidatabaseassistant.report.entity.ReportHistory;
import com.aidatabaseassistant.report.exporter.CsvExporter;
import com.aidatabaseassistant.report.exporter.PdfExporter;
import com.aidatabaseassistant.report.repository.ReportHistoryRepository;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReportService {

    private final PdfExporter pdfExporter;
    private final CsvExporter csvExporter;
    private final ReportHistoryRepository reportHistoryRepository;
    private final ApplicationEventPublisher eventPublisher;

    public ReportService(PdfExporter pdfExporter, CsvExporter csvExporter,
                         ReportHistoryRepository reportHistoryRepository,
                         ApplicationEventPublisher eventPublisher) {
        this.pdfExporter = pdfExporter;
        this.csvExporter = csvExporter;
        this.reportHistoryRepository = reportHistoryRepository;
        this.eventPublisher = eventPublisher;
    }

    public byte[] exportPdf(ReportDto reportDto, Long userId) {
        byte[] pdfBytes = pdfExporter.export(reportDto);
        
        saveHistoryAndLogAudit(userId, "PDF_EXPORT", (long) pdfBytes.length, pdfBytes);

        return pdfBytes;
    }

    public byte[] exportCsv(ReportDto reportDto, Long userId) {
        byte[] csvBytes = csvExporter.export(reportDto);

        saveHistoryAndLogAudit(userId, "CSV_EXPORT", (long) csvBytes.length, csvBytes);

        return csvBytes;
    }

    public List<ReportHistory> getHistoryForUser(Long userId) {
        return reportHistoryRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public byte[] downloadReport(Long reportHistoryId, Long userId) {
        ReportHistory history = reportHistoryRepository.findById(reportHistoryId)
                .orElseThrow(() -> new RuntimeException("Report not found"));
        if (!history.getUserId().equals(userId)) {
            throw new RuntimeException("Unauthorized access to report");
        }
        return history.getFileData() != null ? history.getFileData() : new byte[0];
    }

    private void saveHistoryAndLogAudit(Long userId, String exportFormat, Long fileSize, byte[] fileData) {
        // Save History
        ReportHistory history = new ReportHistory(userId, "QUERY_RESULTS", exportFormat, fileSize);
        history.setFileData(fileData);
        reportHistoryRepository.save(history);

        // Publish Audit Event
        EventType eventType = "PDF_EXPORT".equals(exportFormat) ? EventType.PDF_EXPORT : EventType.CSV_EXPORT;
        eventPublisher.publishEvent(new AuditEvent.Builder(this)
                .userId(userId)
                .eventType(eventType)
                .severity(Severity.INFO)
                .description("Exported report as " + exportFormat)
                .build());
    }
}
