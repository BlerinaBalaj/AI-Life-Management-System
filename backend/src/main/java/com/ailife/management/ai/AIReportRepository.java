package com.ailife.management.ai;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;
import java.util.Optional;
import java.time.LocalDate;

public interface AIReportRepository extends JpaRepository<AIReport, Long>, JpaSpecificationExecutor<AIReport> {
    List<AIReport> findByUserIdAndTenantIdOrderByPeriodEndDesc(Long userId, Long tenantId);
    Optional<AIReport> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);
    Optional<AIReport> findByUserIdAndTenantIdAndReportTypeAndPeriodStartAndPeriodEnd(
            Long userId, Long tenantId, String reportType, LocalDate periodStart, LocalDate periodEnd);
}
