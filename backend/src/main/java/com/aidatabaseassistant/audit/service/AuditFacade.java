package com.aidatabaseassistant.audit.service;

import com.aidatabaseassistant.audit.entity.AuditLog;
import com.aidatabaseassistant.audit.enums.AuditEventType;
import com.aidatabaseassistant.audit.enums.Severity;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
public class AuditFacade {

    private final AuditService auditService;

    public AuditFacade(AuditService auditService) {
        this.auditService = auditService;
    }

    public void logLogin(Long userId, boolean success) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .eventType(AuditEventType.LOGIN)
                .severity(success ? Severity.INFO : Severity.WARNING)
                .description(success ? "User logged in successfully" : "Failed login attempt")
                .build();
        auditService.save(log);
    }

    public void logRegister(Long userId) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .eventType(AuditEventType.REGISTER)
                .severity(Severity.INFO)
                .description("User registered successfully")
                .build();
        auditService.save(log);
    }

    public void logPasswordChanged(Long userId) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .eventType(AuditEventType.PASSWORD_CHANGED)
                .severity(Severity.INFO)
                .description("User changed password")
                .build();
        auditService.save(log);
    }

    public void logConnectionCreated(Long userId, Long connectionId) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .connectionId(connectionId)
                .eventType(AuditEventType.CONNECTION_CREATED)
                .severity(Severity.INFO)
                .description("Database connection created")
                .build();
        auditService.save(log);
    }

    public void logConnectionUpdated(Long userId, Long connectionId) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .connectionId(connectionId)
                .eventType(AuditEventType.CONNECTION_UPDATED)
                .severity(Severity.INFO)
                .description("Database connection updated")
                .build();
        auditService.save(log);
    }

    public void logConnectionDeleted(Long userId, Long connectionId) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .connectionId(connectionId)
                .eventType(AuditEventType.CONNECTION_DELETED)
                .severity(Severity.WARNING)
                .description("Database connection deleted")
                .build();
        auditService.save(log);
    }

    public void logConnectionTested(Long userId, Long connectionId, boolean success, String errorMessage) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .connectionId(connectionId)
                .eventType(AuditEventType.CONNECTION_TESTED)
                .severity(success ? Severity.INFO : Severity.WARNING)
                .description(success ? "Connection tested successfully" : "Connection test failed: " + errorMessage)
                .build();
        auditService.save(log);
    }

    public void logChatCreated(Long userId, UUID chatSessionId, Long connectionId) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .chatSessionId(chatSessionId)
                .connectionId(connectionId)
                .eventType(AuditEventType.CHAT_CREATED)
                .severity(Severity.INFO)
                .description("Chat session created")
                .build();
        auditService.save(log);
    }

    public void logChatRenamed(Long userId, UUID chatSessionId) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .chatSessionId(chatSessionId)
                .eventType(AuditEventType.CHAT_RENAMED)
                .severity(Severity.INFO)
                .description("Chat session renamed")
                .build();
        auditService.save(log);
    }

    public void logChatDeleted(Long userId, UUID chatSessionId) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .chatSessionId(chatSessionId)
                .eventType(AuditEventType.CHAT_DELETED)
                .severity(Severity.WARNING)
                .description("Chat session deleted")
                .build();
        auditService.save(log);
    }

    public void logQueryExecuted(Long userId, UUID chatSessionId, Long connectionId, String provider, int executionTimeMs) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .chatSessionId(chatSessionId)
                .connectionId(connectionId)
                .provider(provider)
                .executionTimeMs(executionTimeMs)
                .eventType(AuditEventType.QUERY_EXECUTED)
                .severity(Severity.INFO)
                .description("SQL Query executed successfully")
                .build();
        auditService.save(log);
    }

    public void logQueryFailed(Long userId, UUID chatSessionId, Long connectionId, String provider, String error) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .chatSessionId(chatSessionId)
                .connectionId(connectionId)
                .provider(provider)
                .eventType(AuditEventType.QUERY_FAILED)
                .severity(Severity.ERROR)
                .description("SQL Query failed: " + error)
                .build();
        auditService.save(log);
    }

    public void logPolicyViolation(Long userId, UUID chatSessionId, Long connectionId, String reason) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .chatSessionId(chatSessionId)
                .connectionId(connectionId)
                .eventType(AuditEventType.POLICY_VIOLATION)
                .severity(Severity.SECURITY)
                .description("Policy violation detected: " + reason)
                .build();
        auditService.save(log);
    }

    public void logInvalidJwt(String email, String errorMsg) {
        AuditLog log = AuditLog.builder()
                .userId(null) // Unauthenticated
                .eventType(AuditEventType.LOGIN)
                .severity(Severity.WARNING)
                .description("Invalid JWT attempt for email: " + email + ". Error: " + errorMsg)
                .build();
        auditService.save(log);
    }

    public void logReportExported(Long userId, AuditEventType exportType) {
        AuditLog log = AuditLog.builder()
                .userId(userId)
                .eventType(exportType)
                .severity(Severity.INFO)
                .description("Exported report as " + exportType.name())
                .build();
        auditService.save(log);
    }
}
