package com.aidatabaseassistant.audit.listener;

import com.aidatabaseassistant.audit.event.AuditEvent;
import com.aidatabaseassistant.audit.service.AuditService;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

@Component
public class AuditEventListener {

    private final AuditService auditService;

    public AuditEventListener(AuditService auditService) {
        this.auditService = auditService;
    }

    @Async("auditTaskExecutor")
    @EventListener
    public void handleAuditEvent(AuditEvent event) {
        auditService.logEvent(event, event.getIpAddress(), event.getUserAgent());
    }
}
