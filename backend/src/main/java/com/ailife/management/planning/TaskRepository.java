package com.ailife.management.planning;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    List<Task> findByUserIdAndTenantId(Long userId, Long tenantId);
    Optional<Task> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);
}
