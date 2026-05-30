package com.ailife.management.planning;

import com.ailife.management.common.CurrentUserService;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.common.PagedResponse;
import com.ailife.management.common.RequestReader;
import com.ailife.management.exception.ResourceNotFoundException;
import com.ailife.management.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class PlanningService {
    private final CurrentUserService currentUserService;
    private final DailyPlanRepository dailyPlanRepository;
    private final TaskRepository taskRepository;
    private final HabitRepository habitRepository;
    private final HabitLogRepository habitLogRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "dailyPlans", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId()")
    public List<Map<String, Object>> dailyPlans() {
        User user = currentUserService.requireUser();
        return dailyPlanRepository.findByUserIdAndTenantIdOrderByPlanDateDesc(user.getId(), user.getTenant().getId())
                .stream()
                .map(DtoMapper::dailyPlan)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"dailyPlans", "tasks", "searchTasks"}, allEntries = true)
    public Map<String, Object> createDailyPlan(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        DailyPlan plan = new DailyPlan();
        plan.setTenant(user.getTenant());
        plan.setUser(user);
        plan.setPlanDate(RequestReader.date(body, "planDate") == null ? LocalDate.now() : RequestReader.date(body, "planDate"));
        plan.setTitle(RequestReader.string(body, "title", "Daily plan"));
        plan.setSummary(RequestReader.string(body, "summary", ""));
        plan.setAiGenerated(RequestReader.bool(body, "aiGenerated", false));
        return DtoMapper.dailyPlan(dailyPlanRepository.save(plan));
    }

    @Transactional
    @CacheEvict(value = {"dailyPlans", "tasks", "searchTasks"}, allEntries = true)
    public Map<String, Object> updateDailyPlan(Long id, Map<String, Object> body) {
        User user = currentUserService.requireUser();
        DailyPlan plan = dailyPlanRepository.findByIdAndUserIdAndTenantId(id, user.getId(), user.getTenant().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Daily plan not found"));
        if (RequestReader.date(body, "planDate") != null) {
            plan.setPlanDate(RequestReader.date(body, "planDate"));
        }
        plan.setTitle(RequestReader.string(body, "title", plan.getTitle()));
        plan.setSummary(RequestReader.string(body, "summary", plan.getSummary()));
        plan.setAiGenerated(RequestReader.bool(body, "aiGenerated", plan.isAiGenerated()));
        return DtoMapper.dailyPlan(dailyPlanRepository.save(plan));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "tasks", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId() + ':' + (#status ?: 'ALL')")
    public List<Map<String, Object>> tasks(String status) {
        User user = currentUserService.requireUser();
        return taskRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId())
                .stream()
                .filter(task -> status == null || task.getStatus().equalsIgnoreCase(status))
                .map(DtoMapper::task)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> tasksPaged(String status, int page, int size) {
        User user = currentUserService.requireUser();
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Task> taskPage = taskRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId(), pageRequest);
        List<Map<String, Object>> content = taskPage.getContent().stream()
                .filter(task -> status == null || task.getStatus().equalsIgnoreCase(status))
                .map(DtoMapper::task)
                .collect(Collectors.toList());
        return PagedResponse.of(content, page, size, taskPage.getTotalElements());
    }

    @Transactional
    @CacheEvict(value = {"tasks", "searchTasks"}, allEntries = true)
    public Map<String, Object> createTask(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        Task task = new Task();
        task.setTenant(user.getTenant());
        task.setUser(user);
        applyTask(task, body, user);
        return DtoMapper.task(taskRepository.save(task));
    }

    @Transactional
    @CacheEvict(value = {"tasks", "searchTasks"}, allEntries = true)
    public Map<String, Object> updateTask(Long id, Map<String, Object> body) {
        User user = currentUserService.requireUser();
        Task task = taskRepository.findByIdAndUserIdAndTenantId(id, user.getId(), user.getTenant().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        applyTask(task, body, user);
        return DtoMapper.task(taskRepository.save(task));
    }

    @Transactional
    @CacheEvict(value = {"tasks", "searchTasks"}, allEntries = true)
    public void deleteTask(Long id) {
        User user = currentUserService.requireUser();
        Task task = taskRepository.findByIdAndUserIdAndTenantId(id, user.getId(), user.getTenant().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Task not found"));
        taskRepository.delete(task);
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "habits", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId()")
    public List<Map<String, Object>> habits() {
        User user = currentUserService.requireUser();
        return habitRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId())
                .stream()
                .map(DtoMapper::habit)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = "habits", allEntries = true)
    public Map<String, Object> createHabit(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        Habit habit = new Habit();
        habit.setTenant(user.getTenant());
        habit.setUser(user);
        habit.setName(RequestReader.string(body, "name", "Habit"));
        habit.setDescription(RequestReader.string(body, "description", ""));
        habit.setFrequency(RequestReader.string(body, "frequency", "DAILY"));
        habit.setActive(RequestReader.bool(body, "active", true));
        return DtoMapper.habit(habitRepository.save(habit));
    }

    @Transactional
    @CacheEvict(value = "habits", allEntries = true)
    public Map<String, Object> logHabit(Long habitId, Map<String, Object> body) {
        User user = currentUserService.requireUser();
        Habit habit = habitRepository.findById(habitId)
                .filter(candidate -> candidate.getUser().getId().equals(user.getId()))
                .filter(candidate -> candidate.getTenant().getId().equals(user.getTenant().getId()))
                .orElseThrow(() -> new ResourceNotFoundException("Habit not found"));
        HabitLog log = new HabitLog();
        log.setTenant(user.getTenant());
        log.setUser(user);
        log.setHabit(habit);
        log.setLogDate(RequestReader.date(body, "logDate") == null ? LocalDate.now() : RequestReader.date(body, "logDate"));
        log.setCompleted(RequestReader.bool(body, "completed", true));
        log.setNotes(RequestReader.string(body, "notes", ""));
        return DtoMapper.habitLog(habitLogRepository.save(log));
    }

    private void applyTask(Task task, Map<String, Object> body, User user) {
        task.setTitle(RequestReader.string(body, "title", task.getTitle()));
        task.setDescription(RequestReader.string(body, "description", task.getDescription()));
        task.setStatus(RequestReader.string(body, "status", task.getStatus()));
        Integer priority = RequestReader.integer(body, "priority");
        if (priority != null) {
            task.setPriority(priority);
        }
        if (RequestReader.date(body, "dueDate") != null) {
            task.setDueDate(RequestReader.date(body, "dueDate"));
        }
        if (RequestReader.time(body, "startTime") != null) {
            task.setStartTime(RequestReader.time(body, "startTime"));
        }
        if (RequestReader.time(body, "endTime") != null) {
            task.setEndTime(RequestReader.time(body, "endTime"));
        }
        Long dailyPlanId = RequestReader.longValue(body, "dailyPlanId");
        if (dailyPlanId != null) {
            DailyPlan plan = dailyPlanRepository.findByIdAndUserIdAndTenantId(dailyPlanId, user.getId(), user.getTenant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("Daily plan not found"));
            task.setDailyPlan(plan);
        }
    }
}
