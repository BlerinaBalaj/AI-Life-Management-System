package com.ailife.management.wellbeing;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface StressLogRepository extends JpaRepository<StressLog, Long> {
    List<StressLog> findByUserIdAndTenantIdAndLoggedAtBetween(Long userId, Long tenantId, LocalDateTime from, LocalDateTime to);
}
