package com.ailife.management.planning;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface HabitLogRepository extends JpaRepository<HabitLog, Long> {
    List<HabitLog> findByUserIdAndTenantIdAndLogDateBetween(Long userId, Long tenantId, LocalDate from, LocalDate to);
}
