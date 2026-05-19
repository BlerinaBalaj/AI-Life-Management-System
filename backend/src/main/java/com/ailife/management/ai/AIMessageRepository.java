package com.ailife.management.ai;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AIMessageRepository extends JpaRepository<AIMessage, Long> {
    List<AIMessage> findByConversationIdAndUserIdAndTenantIdOrderByCreatedAtAsc(Long conversationId, Long userId, Long tenantId);
}
