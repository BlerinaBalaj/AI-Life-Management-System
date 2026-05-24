package com.ailife.management.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface AIReportRepository extends JpaRepository<AIReport, Long>, JpaSpecificationExecutor<AIReport> {
    List<AIReport> findByUserIdAndTenantIdOrderByPeriodEndDesc(Long userId, Long tenantId);
    Optional<AIReport> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);
    Optional<AIReport> findByUserIdAndTenantIdAndReportTypeAndPeriodStartAndPeriodEnd(
            Long userId, Long tenantId, String reportType, LocalDate periodStart, LocalDate periodEnd);

    @Query("select r from AIReport r where r.user.id = :userId and r.tenant.id = :tenantId "
            + "and (:type is null or lower(r.reportType) = lower(:type)) order by r.periodEnd desc")
    List<AIReport> searchByUserTenant(
            @Param("userId") Long userId,
            @Param("tenantId") Long tenantId,
            @Param("type") String type);
}
