package com.ailife.management.user;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PreferenceRepository extends JpaRepository<Preference, Long> {
    List<Preference> findByUserIdAndTenantId(Long userId, Long tenantId);
}
