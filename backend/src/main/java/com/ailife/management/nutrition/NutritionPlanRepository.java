package com.ailife.management.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, Long>, JpaSpecificationExecutor<NutritionPlan> {
    List<NutritionPlan> findByUserIdAndTenantId(Long userId, Long tenantId);
    Optional<NutritionPlan> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);
}
