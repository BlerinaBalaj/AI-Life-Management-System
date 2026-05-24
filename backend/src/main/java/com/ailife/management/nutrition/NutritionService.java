package com.ailife.management.nutrition;

import com.ailife.management.common.CurrentUserService;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.common.RequestReader;
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
public class NutritionService {
    private final CurrentUserService currentUserService;
    private final NutritionPlanRepository nutritionPlanRepository;
    private final FoodLogRepository foodLogRepository;

    @Transactional(readOnly = true)
    @Cacheable(value = "nutritionPlans", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId() + ':' + (#minCalories ?: 'MIN') + ':' + (#maxCalories ?: 'MAX')")
    public List<Map<String, Object>> plans(Integer minCalories, Integer maxCalories) {
        User user = currentUserService.requireUser();
        return nutritionPlanRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId())
                .stream()
                .filter(plan -> minCalories == null || plan.getDailyCalories() == null || plan.getDailyCalories() >= minCalories)
                .filter(plan -> maxCalories == null || plan.getDailyCalories() == null || plan.getDailyCalories() <= maxCalories)
                .map(DtoMapper::nutritionPlan)
                .collect(Collectors.toList());
    }

    @Transactional
    @CacheEvict(value = {"nutritionPlans", "searchNutrition"}, allEntries = true)
    public Map<String, Object> createPlan(Map<String, Object> body, boolean aiGenerated) {
        User user = currentUserService.requireUser();
        NutritionPlan plan = new NutritionPlan();
        plan.setTenant(user.getTenant());
        plan.setUser(user);
        plan.setTitle(RequestReader.string(body, "title", "Nutrition plan"));
        plan.setDescription(RequestReader.string(body, "description", ""));
        plan.setDailyCalories(RequestReader.integer(body, "dailyCalories"));
        plan.setProteinGrams(RequestReader.integer(body, "proteinGrams"));
        plan.setCarbsGrams(RequestReader.integer(body, "carbsGrams"));
        plan.setFatGrams(RequestReader.integer(body, "fatGrams"));
        plan.setAiGenerated(aiGenerated || RequestReader.bool(body, "aiGenerated", false));
        return DtoMapper.nutritionPlan(nutritionPlanRepository.save(plan));
    }

    @Transactional
    @CacheEvict(value = "foodLogs", allEntries = true)
    public Map<String, Object> createFoodLog(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        FoodLog log = new FoodLog();
        log.setTenant(user.getTenant());
        log.setUser(user);
        log.setConsumedAt(RequestReader.dateTime(body, "consumedAt") == null ? LocalDateTime.now() : RequestReader.dateTime(body, "consumedAt"));
        log.setFoodName(RequestReader.string(body, "foodName", "Food"));
        log.setMealType(RequestReader.string(body, "mealType", "MEAL"));
        log.setCalories(RequestReader.integer(body, "calories"));
        log.setProteinGrams(RequestReader.integer(body, "proteinGrams"));
        log.setCarbsGrams(RequestReader.integer(body, "carbsGrams"));
        log.setFatGrams(RequestReader.integer(body, "fatGrams"));
        return DtoMapper.foodLog(foodLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    @Cacheable(value = "foodLogs", key = "@currentUserService.userId() + ':' + @currentUserService.tenantId() + ':' + (#from ?: 'MIN') + ':' + (#to ?: 'MAX')")
    public List<Map<String, Object>> foodLogs(LocalDateTime from, LocalDateTime to) {
        User user = currentUserService.requireUser();
        LocalDateTime start = from == null ? LocalDateTime.of(1970, 1, 1, 0, 0) : from;
        LocalDateTime end = to == null ? LocalDateTime.now().plusDays(1) : to;
        return foodLogRepository.findByUserIdAndTenantIdAndConsumedAtBetween(user.getId(), user.getTenant().getId(), start, end)
                .stream()
                .map(DtoMapper::foodLog)
                .collect(Collectors.toList());
    }
}
