package com.ailife.management.ai;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface AIConversationRepository extends JpaRepository<AIConversation, Long> {
    List<AIConversation> findByUserIdAndTenantId(Long userId, Long tenantId);
    Optional<AIConversation> findByIdAndUserIdAndTenantId(Long id, Long userId, Long tenantId);
}
