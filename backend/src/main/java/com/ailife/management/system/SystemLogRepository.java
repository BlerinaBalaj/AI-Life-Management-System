package com.ailife.management.system;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    List<SystemLog> findTop50ByTenantIdOrderByCreatedAtDesc(Long tenantId);
}
