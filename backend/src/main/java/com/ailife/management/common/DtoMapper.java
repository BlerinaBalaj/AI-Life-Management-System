package com.ailife.management.common;

import com.ailife.management.ai.AIConversation;
import com.ailife.management.ai.AIMessage;
import com.ailife.management.ai.AIReport;
import com.ailife.management.ai.AIRequestLog;
import com.ailife.management.fitness.WorkoutPlan;
import com.ailife.management.fitness.WorkoutSession;
import com.ailife.management.goal.Goal;
import com.ailife.management.notification.Notification;
import com.ailife.management.nutrition.FoodLog;
import com.ailife.management.nutrition.NutritionPlan;
import com.ailife.management.planning.DailyPlan;
import com.ailife.management.planning.Habit;
import com.ailife.management.planning.HabitLog;
import com.ailife.management.planning.Task;
import com.ailife.management.progress.ProgressTracker;
import com.ailife.management.user.Preference;
import com.ailife.management.user.User;
import com.ailife.management.user.UserProfile;
import com.ailife.management.wellbeing.MoodLog;
import com.ailife.management.wellbeing.StressLog;

import java.util.LinkedHashMap;
import java.util.Map;

public final class DtoMapper {
    private DtoMapper() {
    }

    public static Map<String, Object> user(User user) {
        Map<String, Object> dto = base(user);
        dto.put("email", user.getEmail());
        dto.put("fullName", user.getFullName());
        dto.put("enabled", user.isEnabled());
        dto.put("role", user.getRole().getName().name());
        dto.put("tenantId", user.getTenant().getId());
        return dto;
    }

    public static Map<String, Object> profile(UserProfile profile) {
        Map<String, Object> dto = base(profile);
        dto.put("birthDate", profile.getBirthDate());
        dto.put("heightCm", profile.getHeightCm());
        dto.put("weightKg", profile.getWeightKg());
        dto.put("activityLevel", profile.getActivityLevel());
        dto.put("primaryFocus", profile.getPrimaryFocus());
        return dto;
    }

    public static Map<String, Object> preference(Preference preference) {
        Map<String, Object> dto = base(preference);
        dto.put("key", preference.getPreferenceKey());
        dto.put("value", preference.getPreferenceValue());
        return dto;
    }

    public static Map<String, Object> goal(Goal goal) {
        Map<String, Object> dto = base(goal);
        dto.put("title", goal.getTitle());
        dto.put("description", goal.getDescription());
        dto.put("status", goal.getStatus());
        dto.put("priority", goal.getPriority());
        dto.put("targetDate", goal.getTargetDate());
        dto.put("categoryId", goal.getCategory() == null ? null : goal.getCategory().getId());
        return dto;
    }

    public static Map<String, Object> dailyPlan(DailyPlan plan) {
        Map<String, Object> dto = base(plan);
        dto.put("planDate", plan.getPlanDate());
        dto.put("title", plan.getTitle());
        dto.put("summary", plan.getSummary());
        dto.put("aiGenerated", plan.isAiGenerated());
        dto.put("taskCount", plan.getTasks() == null ? 0 : plan.getTasks().size());
        return dto;
    }

    public static Map<String, Object> task(Task task) {
        Map<String, Object> dto = base(task);
        dto.put("title", task.getTitle());
        dto.put("description", task.getDescription());
        dto.put("status", task.getStatus());
        dto.put("priority", task.getPriority());
        dto.put("dueDate", task.getDueDate());
        dto.put("startTime", task.getStartTime());
        dto.put("endTime", task.getEndTime());
        dto.put("dailyPlanId", task.getDailyPlan() == null ? null : task.getDailyPlan().getId());
        return dto;
    }

    public static Map<String, Object> habit(Habit habit) {
        Map<String, Object> dto = base(habit);
        dto.put("name", habit.getName());
        dto.put("description", habit.getDescription());
        dto.put("frequency", habit.getFrequency());
        dto.put("active", habit.isActive());
        return dto;
    }

    public static Map<String, Object> habitLog(HabitLog log) {
        Map<String, Object> dto = base(log);
        dto.put("habitId", log.getHabit().getId());
        dto.put("logDate", log.getLogDate());
        dto.put("completed", log.isCompleted());
        dto.put("notes", log.getNotes());
        return dto;
    }

    public static Map<String, Object> workoutPlan(WorkoutPlan plan) {
        Map<String, Object> dto = base(plan);
        dto.put("title", plan.getTitle());
        dto.put("description", plan.getDescription());
        dto.put("difficulty", plan.getDifficulty());
        dto.put("daysPerWeek", plan.getDaysPerWeek());
        dto.put("aiGenerated", plan.isAiGenerated());
        return dto;
    }

    public static Map<String, Object> workoutSession(WorkoutSession session) {
        Map<String, Object> dto = base(session);
        dto.put("workoutPlanId", session.getWorkoutPlan() == null ? null : session.getWorkoutPlan().getId());
        dto.put("startedAt", session.getStartedAt());
        dto.put("endedAt", session.getEndedAt());
        dto.put("durationMinutes", session.getDurationMinutes());
        dto.put("caloriesBurned", session.getCaloriesBurned());
        dto.put("notes", session.getNotes());
        return dto;
    }

    public static Map<String, Object> nutritionPlan(NutritionPlan plan) {
        Map<String, Object> dto = base(plan);
        dto.put("title", plan.getTitle());
        dto.put("description", plan.getDescription());
        dto.put("dailyCalories", plan.getDailyCalories());
        dto.put("proteinGrams", plan.getProteinGrams());
        dto.put("carbsGrams", plan.getCarbsGrams());
        dto.put("fatGrams", plan.getFatGrams());
        dto.put("aiGenerated", plan.isAiGenerated());
        return dto;
    }

    public static Map<String, Object> foodLog(FoodLog log) {
        Map<String, Object> dto = base(log);
        dto.put("consumedAt", log.getConsumedAt());
        dto.put("foodName", log.getFoodName());
        dto.put("mealType", log.getMealType());
        dto.put("calories", log.getCalories());
        dto.put("proteinGrams", log.getProteinGrams());
        dto.put("carbsGrams", log.getCarbsGrams());
        dto.put("fatGrams", log.getFatGrams());
        return dto;
    }

    public static Map<String, Object> moodLog(MoodLog log) {
        Map<String, Object> dto = base(log);
        dto.put("loggedAt", log.getLoggedAt());
        dto.put("moodScore", log.getMoodScore());
        dto.put("moodLabel", log.getMoodLabel());
        dto.put("journalText", log.getJournalText());
        dto.put("aiAnalysis", log.getAiAnalysis());
        return dto;
    }

    public static Map<String, Object> stressLog(StressLog log) {
        Map<String, Object> dto = base(log);
        dto.put("loggedAt", log.getLoggedAt());
        dto.put("stressLevel", log.getStressLevel());
        dto.put("trigger", log.getTrigger());
        dto.put("copingAction", log.getCopingAction());
        return dto;
    }

    public static Map<String, Object> progress(ProgressTracker tracker) {
        Map<String, Object> dto = base(tracker);
        dto.put("trackedDate", tracker.getTrackedDate());
        dto.put("metricName", tracker.getMetricName());
        dto.put("metricValue", tracker.getMetricValue());
        dto.put("unit", tracker.getUnit());
        dto.put("notes", tracker.getNotes());
        dto.put("goalId", tracker.getGoal() == null ? null : tracker.getGoal().getId());
        return dto;
    }

    public static Map<String, Object> aiReport(AIReport report) {
        Map<String, Object> dto = base(report);
        dto.put("periodStart", report.getPeriodStart());
        dto.put("periodEnd", report.getPeriodEnd());
        dto.put("reportType", report.getReportType());
        dto.put("status", report.getStatus());
        dto.put("contentJson", report.getContentJson());
        return dto;
    }

    public static Map<String, Object> aiConversation(AIConversation conversation) {
        Map<String, Object> dto = base(conversation);
        dto.put("title", conversation.getTitle());
        dto.put("channel", conversation.getChannel());
        return dto;
    }

    public static Map<String, Object> aiMessage(AIMessage message) {
        Map<String, Object> dto = base(message);
        dto.put("conversationId", message.getConversation().getId());
        dto.put("sender", message.getSender());
        dto.put("content", message.getContent());
        return dto;
    }

    public static Map<String, Object> aiLog(AIRequestLog log) {
        Map<String, Object> dto = base(log);
        dto.put("requestType", log.getRequestType());
        dto.put("model", log.getModel());
        dto.put("successful", log.isSuccessful());
        dto.put("errorMessage", log.getErrorMessage());
        return dto;
    }

    public static Map<String, Object> notification(Notification notification) {
        Map<String, Object> dto = base(notification);
        dto.put("title", notification.getTitle());
        dto.put("message", notification.getMessage());
        dto.put("channel", notification.getChannel());
        dto.put("read", notification.isReadFlag());
        return dto;
    }

    private static Map<String, Object> base(BaseEntity entity) {
        Map<String, Object> dto = new LinkedHashMap<>();
        dto.put("id", entity.getId());
        dto.put("createdAt", entity.getCreatedAt());
        dto.put("updatedAt", entity.getUpdatedAt());
        return dto;
    }
}
