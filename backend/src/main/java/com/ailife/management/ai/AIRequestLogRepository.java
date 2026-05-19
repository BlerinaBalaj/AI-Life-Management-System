package com.ailife.management.ai;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AIRequestLogRepository extends JpaRepository<AIRequestLog, Long> {
    List<AIRequestLog> findTop20ByUserIdAndTenantIdOrderByCreatedAtDesc(Long userId, Long tenantId);
}
