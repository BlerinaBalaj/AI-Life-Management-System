package com.ailife.management.fitness;

import com.ailife.management.common.CurrentUserService;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.common.RequestReader;
import com.ailife.management.exception.ResourceNotFoundException;
import com.ailife.management.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FitnessService {
    private final CurrentUserService currentUserService;
    private final WorkoutPlanRepository workoutPlanRepository;
    private final WorkoutSessionRepository workoutSessionRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "workoutPlans", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId() + ':' + (#difficulty ?: 'ALL')")
    public List<Map<String, Object>> workoutPlans(String difficulty) {
        User user = currentUserService.requireUser();
        return workoutPlanRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId())
                .stream()
                .filter(plan -> difficulty == null || plan.getDifficulty().equalsIgnoreCase(difficulty))
                .map(DtoMapper::workoutPlan)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"workoutPlans", "searchWorkouts"}, allEntries = true)
    public Map<String, Object> createWorkoutPlan(Map<String, Object> body, boolean aiGenerated) {
        User user = currentUserService.requireUser();
        WorkoutPlan plan = new WorkoutPlan();
        plan.setTenant(user.getTenant());
        plan.setUser(user);
        plan.setTitle(RequestReader.string(body, "title", "Workout plan"));
        plan.setDescription(RequestReader.string(body, "description", ""));
        plan.setDifficulty(RequestReader.string(body, "difficulty", "BEGINNER"));
        Integer days = RequestReader.integer(body, "daysPerWeek");
        plan.setDaysPerWeek(days == null ? 3 : days);
        plan.setAiGenerated(aiGenerated || RequestReader.bool(body, "aiGenerated", false));
        return DtoMapper.workoutPlan(workoutPlanRepository.save(plan));
    }

    @Transactional
    @CacheEvict(value = "workoutSessions", allEntries = true)
    public Map<String, Object> createWorkoutSession(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        WorkoutSession session = new WorkoutSession();
        session.setTenant(user.getTenant());
        session.setUser(user);
        Long planId = RequestReader.longValue(body, "workoutPlanId");
        if (planId != null) {
            WorkoutPlan plan = workoutPlanRepository.findByIdAndUserIdAndTenantId(planId, user.getId(), user.getTenant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Workout plan not found"));
            session.setWorkoutPlan(plan);
        }
        session.setStartedAt(RequestReader.dateTime(body, "startedAt") == null ? LocalDateTime.now() : RequestReader.dateTime(body, "startedAt"));
        session.setEndedAt(RequestReader.dateTime(body, "endedAt"));
        session.setDurationMinutes(RequestReader.integer(body, "durationMinutes"));
        session.setCaloriesBurned(RequestReader.integer(body, "caloriesBurned"));
        session.setNotes(RequestReader.string(body, "notes", ""));
        return DtoMapper.workoutSession(workoutSessionRepository.save(session));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "workoutSessions", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId() + ':' + (#from ?: 'MIN') + ':' + (#to ?: 'MAX')")
    public List<Map<String, Object>> sessions(LocalDateTime from, LocalDateTime to) {
        User user = currentUserService.requireUser();
        LocalDateTime start = from == null ? LocalDateTime.of(1970, 1, 1, 0, 0) : from;
        LocalDateTime end = to == null ? LocalDateTime.now().plusDays(1) : to;
        return workoutSessionRepository.findByUserIdAndTenantIdAndStartedAtBetween(user.getId(), user.getTenant().getId(), start, end)
                .stream()
                .map(DtoMapper::workoutSession)
                .collect(Collectors.toList());
    }
}
