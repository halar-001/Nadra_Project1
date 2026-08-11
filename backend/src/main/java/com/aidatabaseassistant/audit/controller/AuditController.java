package com.aidatabaseassistant.audit.controller;

import com.aidatabaseassistant.audit.dto.AuditLogDto;
import com.aidatabaseassistant.audit.entity.AuditLog;
import com.aidatabaseassistant.audit.enums.AuditEventType;
import com.aidatabaseassistant.audit.enums.Severity;
import com.aidatabaseassistant.audit.repository.AuditLogRepository;
import com.aidatabaseassistant.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/audit")
@PreAuthorize("hasRole('ADMIN')")
public class AuditController {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    public AuditController(AuditLogRepository auditLogRepository, UserRepository userRepository) {
        this.auditLogRepository = auditLogRepository;
        this.userRepository = userRepository;
    }

    @GetMapping
    public Page<AuditLogDto> getAuditLogs(
            @RequestParam(required = false) Long userId,
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) AuditEventType eventType,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateFrom,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime dateTo,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<AuditLog> logs = auditLogRepository.findFilteredAuditLogs(
                userId,
                severity,
                eventType,
                dateFrom,
                dateTo,
                PageRequest.of(page, size, Sort.by("createdAt").descending())
        );

        return logs.map(this::mapToDto);
    }

    private AuditLogDto mapToDto(AuditLog log) {
        String userName = null;
        if (log.getUserId() != null) {
            userName = userRepository.findById(log.getUserId())
                    .map(user -> user.getFullName())
                    .orElse("System");
        } else {
            userName = "Unauthenticated";
        }

        return AuditLogDto.builder()
                .id(log.getId())
                .userId(log.getUserId())
                .connectionId(log.getConnectionId())
                .chatSessionId(log.getChatSessionId())
                .eventType(log.getEventType())
                .severity(log.getSeverity())
                .description(log.getDescription())
                .provider(log.getProvider())
                .executionTimeMs(log.getExecutionTimeMs())
                .createdAt(log.getCreatedAt())
                .userName(userName)
                .build();
    }
}
