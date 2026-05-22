package com.ailife.management.nutrition;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MealSuggestionRepository extends JpaRepository<MealSuggestion, Long> {
    List<MealSuggestion> findByUserIdAndTenantId(Long userId, Long tenantId);
}
