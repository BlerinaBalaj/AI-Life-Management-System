package com.ailife.management.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface NutritionPlanRepository extends JpaRepository<NutritionPlan, Long>, JpaSpecificationExecutor<NutritionPlan> {
    List<NutritionPlan> findByUserIdAndTenantId(Long userId, Long tenantId);
    Optional<NutritionPlan> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);

    @Query("select p from NutritionPlan p where p.user.id = :userId and p.tenant.id = :tenantId "
            + "and (:maxCalories is null or p.dailyCalories is null or p.dailyCalories <= :maxCalories) "
            + "and (:query = '' or lower(p.title) like lower(concat('%', :query, '%')) "
            + "or lower(coalesce(p.description, '')) like lower(concat('%', :query, '%')))")
    List<NutritionPlan> searchByUserTenant(
            @Param("userId") Long userId,
            @Param("tenantId") Long tenantId,
            @Param("query") String query,
            @Param("maxCalories") Integer maxCalories);
}
