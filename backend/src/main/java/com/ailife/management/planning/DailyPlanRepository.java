package com.ailife.management.planning;

import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DailyPlanRepository extends JpaRepository<DailyPlan, Long> {
    List<DailyPlan> findByUserIdAndTenantIdOrderByPlanDateDesc(Long userId, Long tenantId);
    Optional<DailyPlan> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);
    Optional<DailyPlan> findByUserIdAndTenantIdAndPlanDate(Long userId, Long tenantId, LocalDate planDate);
}
