package com.ailife.management.search;

import com.ailife.management.ai.AIReportRepository;
import com.ailife.management.common.CurrentUserService;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.fitness.WorkoutPlanRepository;
import com.ailife.management.nutrition.NutritionPlanRepository;
import com.ailife.management.planning.TaskRepository;
import com.ailife.management.user.User;
import com.ailife.management.wellbeing.MoodLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SearchService {
    private final CurrentUserService currentUserService;
    private final TaskRepository taskRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final NutritionPlanRepository nutritionPlanRepository;
    private final MoodLogRepository moodLogRepository;
    private final AIReportRepository aiReportRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "searchTasks", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId() + ':' + (#query ?: '') + ':' + (#status ?: 'ALL')")
    public List<Map<String, Object>> tasks(String query, String status) {
        User user = currentUserService.requireUser();
        String needle = normalize(query);
        return taskRepository.searchByUserTenant(user.getId(), user.getTenant().getId(), needle, status).stream()
                .map(DtoMapper::task)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "searchWorkouts", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId() + ':' + (#query ?: '') + ':' + (#difficulty ?: 'ALL')")
    public List<Map<String, Object>> workouts(String query, String difficulty) {
        User user = currentUserService.requireUser();
        String needle = normalize(query);
        return workoutPlanRepository.searchByUserTenant(user.getId(), user.getTenant().getId(), needle, difficulty).stream()
                .map(DtoMapper::workoutPlan)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "searchNutrition", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId() + ':' + (#query ?: '') + ':' + (#maxCalories ?: 'MAX')")
    public List<Map<String, Object>> nutrition(String query, Integer maxCalories) {
        User user = currentUserService.requireUser();
        String needle = normalize(query);
        return nutritionPlanRepository.searchByUserTenant(user.getId(), user.getTenant().getId(), needle, maxCalories).stream()
                .map(DtoMapper::nutritionPlan)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "searchMoodLogs", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId() + ':' + (#minScore ?: 'MIN')")
    public List<Map<String, Object>> moods(Integer minScore) {
        User user = currentUserService.requireUser();
        return moodLogRepository.findByUserIdAndTenantIdAndLoggedAtBetween(
                        user.getId(), user.getTenant().getId(), java.time.LocalDateTime.now().minusDays(90), java.time.LocalDateTime.now().plusDays(1))
                .stream()
                .filter(log -> minScore == null || log.getMoodScore() >= minScore)
                .map(DtoMapper::moodLog)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "searchAiReports", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId() + ':' + (#type ?: 'ALL')")
    public List<Map<String, Object>> aiReports(String type) {
        User user = currentUserService.requireUser();
        return aiReportRepository.searchByUserTenant(user.getId(), user.getTenant().getId(), type).stream()
                .map(DtoMapper::aiReport)
                .collect(Collectors.toList());
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }
}
