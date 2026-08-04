package com.aidatabaseassistant.audit.service;

import com.aidatabaseassistant.audit.entity.AuditLog;
import com.aidatabaseassistant.audit.event.AuditEvent;
import com.aidatabaseassistant.audit.model.EventType;
import com.aidatabaseassistant.audit.model.Severity;
import com.aidatabaseassistant.audit.repository.AuditLogRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class AuditService {

    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    public void logEvent(AuditEvent event, String ipAddress, String userAgent) {
        AuditLog log = new AuditLog();
        log.setUserId(event.getUserId());
        log.setConnectionId(event.getConnectionId());
        log.setChatSessionId(event.getChatSessionId());
        log.setEventType(event.getEventType());
        log.setSeverity(event.getSeverity());
        log.setDescription(event.getDescription());
        log.setGeneratedSql(event.getGeneratedSql());
        log.setExecutionTimeMs(event.getExecutionTimeMs());
        log.setProvider(event.getProvider());
        log.setIpAddress(ipAddress);
        log.setUserAgent(userAgent);
        
        auditLogRepository.save(log);
    }

    public List<AuditLog> getAllLogs() {
        return auditLogRepository.findAll();
    }

    public List<AuditLog> getLogsByUser(Long userId) {
        return auditLogRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public List<AuditLog> getLogsBySeverity(Severity severity) {
        return auditLogRepository.findBySeverityOrderByCreatedAtDesc(severity);
    }

    public List<AuditLog> getLogsByEventType(EventType eventType) {
        return auditLogRepository.findByEventTypeOrderByCreatedAtDesc(eventType);
    }
}
