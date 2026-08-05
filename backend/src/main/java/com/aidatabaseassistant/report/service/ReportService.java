package com.aidatabaseassistant.report.service;

import com.aidatabaseassistant.audit.service.AuditFacade;
import com.aidatabaseassistant.audit.enums.AuditEventType;
import com.aidatabaseassistant.audit.enums.Severity;
import com.aidatabaseassistant.report.dto.ReportDto;
import com.aidatabaseassistant.report.entity.ReportHistory;
import com.aidatabaseassistant.report.exporter.CsvExporter;
import com.aidatabaseassistant.report.exporter.PdfExporter;
import com.aidatabaseassistant.report.repository.ReportHistoryRepository;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReportService {

    private final PdfExporter pdfExporter;
    private final CsvExporter csvExporter;
    private final ReportHistoryRepository reportHistoryRepository;
    private final AuditFacade auditFacade;

    public ReportService(PdfExporter pdfExporter, CsvExporter csvExporter,
                         ReportHistoryRepository reportHistoryRepository,
                         AuditFacade auditFacade) {
        this.pdfExporter = pdfExporter;
        this.csvExporter = csvExporter;
        this.reportHistoryRepository = reportHistoryRepository;
        this.auditFacade = auditFacade;
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

        // Log Audit Event
        AuditEventType eventType = "PDF_EXPORT".equals(exportFormat) ? AuditEventType.PDF_EXPORT : AuditEventType.CSV_EXPORT;
        auditFacade.logReportExported(userId, eventType);
    }
}
