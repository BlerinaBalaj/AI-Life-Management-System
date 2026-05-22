package com.ailife.management.planning;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface HabitRepository extends JpaRepository<Habit, Long> {
    List<Habit> findByUserIdAndTenantId(Long userId, Long tenantId);
}
