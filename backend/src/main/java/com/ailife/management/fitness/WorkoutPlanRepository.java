package com.ailife.management.fitness;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface WorkoutPlanRepository extends JpaRepository<WorkoutPlan, Long>, JpaSpecificationExecutor<WorkoutPlan> {
    List<WorkoutPlan> findByUserIdAndTenantId(Long userId, Long tenantId);
    Optional<WorkoutPlan> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);

    @Query("select p from WorkoutPlan p where p.user.id = :userId and p.tenant.id = :tenantId "
            + "and (:difficulty is null or lower(p.difficulty) = lower(:difficulty)) "
            + "and (:query = '' or lower(p.title) like lower(concat('%', :query, '%')) "
            + "or lower(coalesce(p.description, '')) like lower(concat('%', :query, '%')))")
    List<WorkoutPlan> searchByUserTenant(
            @Param("userId") Long userId,
            @Param("tenantId") Long tenantId,
            @Param("query") String query,
            @Param("difficulty") String difficulty);
}
