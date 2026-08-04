package com.aidatabaseassistant.audit.controller;

import com.aidatabaseassistant.audit.entity.AuditLog;
import com.aidatabaseassistant.audit.model.EventType;
import com.aidatabaseassistant.audit.model.Severity;
import com.aidatabaseassistant.audit.service.AuditService;
import com.aidatabaseassistant.dto.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/audit")
public class AuditController {

    private final AuditService auditService;

    public AuditController(AuditService auditService) {
        this.auditService = auditService;
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getAllAuditLogs() {
        List<AuditLog> logs = auditService.getAllLogs();
        return ResponseEntity.ok(new ApiResponse<>(true, "Audit logs retrieved successfully", logs));
    }

    @GetMapping("/user/{userId}")
    @PreAuthorize("hasRole('ADMIN') or #userId == principal.id")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getLogsByUser(@PathVariable Long userId) {
        List<AuditLog> logs = auditService.getLogsByUser(userId);
        return ResponseEntity.ok(new ApiResponse<>(true, "User audit logs retrieved successfully", logs));
    }

    @GetMapping("/severity/{severity}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getLogsBySeverity(@PathVariable Severity severity) {
        List<AuditLog> logs = auditService.getLogsBySeverity(severity);
        return ResponseEntity.ok(new ApiResponse<>(true, "Severity audit logs retrieved successfully", logs));
    }

    @GetMapping("/event/{eventType}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ApiResponse<List<AuditLog>>> getLogsByEventType(@PathVariable EventType eventType) {
        List<AuditLog> logs = auditService.getLogsByEventType(eventType);
        return ResponseEntity.ok(new ApiResponse<>(true, "Event audit logs retrieved successfully", logs));
    }
}
