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
    public List<Map<String, Object>> tasks(String query, String status) {
        User user = currentUserService.requireUser();
        String needle = normalize(query);
        return taskRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId()).stream()
                .filter(task -> status == null || task.getStatus().equalsIgnoreCase(status))
                .filter(task -> needle.isEmpty()
                        || normalize(task.getTitle()).contains(needle)
                        || normalize(task.getDescription()).contains(needle))
                .map(DtoMapper::task)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> workouts(String query, String difficulty) {
        User user = currentUserService.requireUser();
        String needle = normalize(query);
        return workoutPlanRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId()).stream()
                .filter(plan -> difficulty == null || plan.getDifficulty().equalsIgnoreCase(difficulty))
                .filter(plan -> needle.isEmpty()
                        || normalize(plan.getTitle()).contains(needle)
                        || normalize(plan.getDescription()).contains(needle))
                .map(DtoMapper::workoutPlan)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> nutrition(String query, Integer maxCalories) {
        User user = currentUserService.requireUser();
        String needle = normalize(query);
        return nutritionPlanRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId()).stream()
                .filter(plan -> maxCalories == null || plan.getDailyCalories() == null || plan.getDailyCalories() <= maxCalories)
                .filter(plan -> needle.isEmpty()
                        || normalize(plan.getTitle()).contains(needle)
                        || normalize(plan.getDescription()).contains(needle))
                .map(DtoMapper::nutritionPlan)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
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
    public List<Map<String, Object>> aiReports(String type) {
        User user = currentUserService.requireUser();
        return aiReportRepository.findByUserIdAndTenantIdOrderByPeriodEndDesc(user.getId(), user.getTenant().getId()).stream()
                .filter(report -> type == null || report.getReportType().equalsIgnoreCase(type))
                .map(DtoMapper::aiReport)
                .collect(Collectors.toList());
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase(Locale.ROOT);
    }
}
