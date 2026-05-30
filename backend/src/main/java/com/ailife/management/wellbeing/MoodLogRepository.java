package com.ailife.management.wellbeing;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

public interface MoodLogRepository extends JpaRepository<MoodLog, Long>, JpaSpecificationExecutor<MoodLog> {
    List<MoodLog> findByUserIdAndTenantIdAndLoggedAtBetween(Long userId, Long tenantId, LocalDateTime from, LocalDateTime to);
    Page<MoodLog> findByUserIdAndTenantId(Long userId, Long tenantId, Pageable pageable);
    Optional<MoodLog> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);
}
