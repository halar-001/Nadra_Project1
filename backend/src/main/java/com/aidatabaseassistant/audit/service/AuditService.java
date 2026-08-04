package com.aidatabaseassistant.audit.service;

import com.aidatabaseassistant.audit.entity.AuditLog;
import com.aidatabaseassistant.audit.repository.AuditLogRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuditService {
    
    private static final Logger log = LoggerFactory.getLogger(AuditService.class);
    
    private final AuditLogRepository auditLogRepository;

    public AuditService(AuditLogRepository auditLogRepository) {
        this.auditLogRepository = auditLogRepository;
    }

    /**
     * Saves the audit log asynchronously to avoid blocking the main thread.
     * Uses a new transaction to ensure the log is saved even if the main transaction rolls back.
     */
    @Async
    @Transactional
    public void save(AuditLog auditLog) {
        try {
            auditLogRepository.save(auditLog);
        } catch (Exception e) {
            log.error("Failed to save audit log: {}", auditLog, e);
        }
    }
}
