package com.aidatabaseassistant.report.repository;

import com.aidatabaseassistant.report.entity.ReportHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface ReportHistoryRepository extends JpaRepository<ReportHistory, UUID> {
    List<ReportHistory> findByUserIdOrderByCreatedAtDesc(Long userId);
}
