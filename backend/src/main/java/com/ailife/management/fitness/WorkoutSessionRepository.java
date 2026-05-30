package com.ailife.management.fitness;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findByUserIdAndTenantIdAndStartedAtBetween(Long userId, Long tenantId, LocalDateTime from, LocalDateTime to);
    List<WorkoutSession> findByUserIdAndTenantId(Long userId, Long tenantId);
}
