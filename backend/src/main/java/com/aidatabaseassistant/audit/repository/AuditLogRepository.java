package com.aidatabaseassistant.audit.repository;

import com.aidatabaseassistant.audit.entity.AuditLog;
import com.aidatabaseassistant.audit.model.EventType;
import com.aidatabaseassistant.audit.model.Severity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, UUID> {
    List<AuditLog> findByUserIdOrderByCreatedAtDesc(Long userId);
    List<AuditLog> findByConnectionIdOrderByCreatedAtDesc(Long connectionId);
    List<AuditLog> findBySeverityOrderByCreatedAtDesc(Severity severity);
    List<AuditLog> findByEventTypeOrderByCreatedAtDesc(EventType eventType);
}
