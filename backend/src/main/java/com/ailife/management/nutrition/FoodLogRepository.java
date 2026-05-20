package com.ailife.management.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface FoodLogRepository extends JpaRepository<FoodLog, Long> {
    List<FoodLog> findByUserIdAndTenantIdAndConsumedAtBetween(Long userId, Long tenantId, LocalDateTime from, LocalDateTime to);
}
