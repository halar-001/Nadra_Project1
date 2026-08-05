package com.aidatabaseassistant.audit.repository;

import com.aidatabaseassistant.audit.entity.AuditLog;
import com.aidatabaseassistant.audit.enums.AuditEventType;
import com.aidatabaseassistant.audit.enums.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {

    @Query("SELECT a FROM AuditLog a WHERE " +
            "(:userId IS NULL OR a.userId = :userId) AND " +
            "(:severity IS NULL OR a.severity = :severity) AND " +
            "(:eventType IS NULL OR a.eventType = :eventType) AND " +
            "(:dateFrom IS NULL OR a.createdAt >= :dateFrom) AND " +
            "(:dateTo IS NULL OR a.createdAt <= :dateTo)")
    Page<AuditLog> findFilteredAuditLogs(
            @Param("userId") Long userId,
            @Param("severity") Severity severity,
            @Param("eventType") AuditEventType eventType,
            @Param("dateFrom") LocalDateTime dateFrom,
            @Param("dateTo") LocalDateTime dateTo,
            Pageable pageable
    );
}
