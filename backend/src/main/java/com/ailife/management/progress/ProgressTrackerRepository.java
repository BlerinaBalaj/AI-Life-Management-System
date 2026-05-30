package com.ailife.management.progress;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface ProgressTrackerRepository extends JpaRepository<ProgressTracker, Long> {
    List<ProgressTracker> findByUserIdAndTenantIdAndTrackedDateBetween(Long userId, Long tenantId, LocalDate from, LocalDate to);
    List<ProgressTracker> findByUserIdAndTenantId(Long userId, Long tenantId);
}
