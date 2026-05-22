package com.ailife.management.notification;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface NotificationRepository extends JpaRepository<Notification, Long> {
    List<Notification> findByUserIdAndTenantIdOrderByCreatedAtDesc(Long userId, Long tenantId);
    Optional<Notification> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);
}
