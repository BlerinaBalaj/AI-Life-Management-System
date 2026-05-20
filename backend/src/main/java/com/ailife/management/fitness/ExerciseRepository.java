package com.ailife.management.fitness;

import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ExerciseRepository extends JpaRepository<Exercise, Long> {
    List<Exercise> findByTenantIdAndMuscleGroupIgnoreCase(Long tenantId, String muscleGroup);
}
