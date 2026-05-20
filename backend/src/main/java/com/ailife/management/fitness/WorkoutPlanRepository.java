package com.ailife.management.fitness;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long>, JpaSpecificationExecutor<WorkoutPlan> {
    List<WorkoutPlan> findByUserIdAndTenantId(Long userId, Long tenantId);
    Optional<WorkoutPlan> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);
}
