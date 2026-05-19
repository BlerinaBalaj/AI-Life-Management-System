package com.ailife.management.ai;

import com.ailife.management.fitness.WorkoutPlanRepository;
import com.ailife.management.goal.GoalRepository;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.nutrition.NutritionPlanRepository;
import com.ailife.management.planning.TaskRepository;
import com.ailife.management.progress.ProgressTrackerRepository;
import com.ailife.management.user.User;
import com.ailife.management.wellbeing.MoodLogRepository;
import com.ailife.management.wellbeing.StressLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class AiContextBuilder {
    private final GoalRepository goalRepository;
    private final TaskRepository taskRepository;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final NutritionPlanRepository nutritionPlanRepository;
    private final MoodLogRepository moodLogRepository;
    private final StressLogRepository stressLogRepository;
    private final ProgressTrackerRepository progressTrackerRepository;

    public Map<String, Object> build(User user, Map<String, Object> request) {
        Long userId = user.getId();
        Long tenantId = user.getTenant().getId();
        Map<String, Object> context = new LinkedHashMap<>();
        context.put("request", request);
        context.put("user", Map.of(
                "id", userId,
                "tenantId", tenantId,
                "fullName", user.getFullName()
        ));
        context.put("goals", goalRepository.findByUserIdAndTenantId(userId, tenantId).stream().map(DtoMapper::goal).collect(Collectors.toList()));
        context.put("tasks", taskRepository.findByUserIdAndTenantId(userId, tenantId).stream().map(DtoMapper::task).collect(Collectors.toList()));
        context.put("workoutPlans", workoutPlanRepository.findByUserIdAndTenantId(userId, tenantId).stream().map(DtoMapper::workoutPlan).collect(Collectors.toList()));
        context.put("nutritionPlans", nutritionPlanRepository.findByUserIdAndTenantId(userId, tenantId).stream().map(DtoMapper::nutritionPlan).collect(Collectors.toList()));
        context.put("moodLogs", moodLogRepository.findByUserIdAndTenantIdAndLoggedAtBetween(
                userId, tenantId, LocalDateTime.now().minusDays(14), LocalDateTime.now().plusDays(1)).stream().map(DtoMapper::moodLog).collect(Collectors.toList()));
        context.put("stressLogs", stressLogRepository.findByUserIdAndTenantIdAndLoggedAtBetween(
                userId, tenantId, LocalDateTime.now().minusDays(14), LocalDateTime.now().plusDays(1)).stream().map(DtoMapper::stressLog).collect(Collectors.toList()));
        context.put("progress", progressTrackerRepository.findByUserIdAndTenantIdAndTrackedDateBetween(
                userId, tenantId, LocalDate.now().minusDays(30), LocalDate.now()).stream().map(DtoMapper::progress).collect(Collectors.toList()));
        return context;
    }
}
