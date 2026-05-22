package com.ailife.management.goal;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface GoalRepository extends JpaRepository<Goal, Long> {
    List<Goal> findByUserIdAndTenantId(Long userId, Long tenantId);
    Optional<Goal> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);
    List<Goal> findByUserIdAndTenantIdAndStatusIgnoreCase(Long userId, Long tenantId, String status);
}
