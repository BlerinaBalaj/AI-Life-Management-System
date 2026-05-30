package com.ailife.management.planning;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface TaskRepository extends JpaRepository<Task, Long>, JpaSpecificationExecutor<Task> {
    List<Task> findByUserIdAndTenantId(Long userId, Long tenantId);
    Page<Task> findByUserIdAndTenantId(Long userId, Long tenantId, Pageable pageable);
    long countByUserIdAndTenantId(Long userId, Long tenantId);
    Optional<Task> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);

    @Query("select t from Task t where t.user.id = :userId and t.tenant.id = :tenantId "
            + "and (:status is null or lower(t.status) = lower(:status)) "
            + "and (:query = '' or lower(t.title) like lower(concat('%', :query, '%')) "
            + "or lower(coalesce(t.description, '')) like lower(concat('%', :query, '%')))")
    List<Task> searchByUserTenant(
            @Param("userId") Long userId,
            @Param("tenantId") Long tenantId,
            @Param("query") String query,
            @Param("status") String status);
}
