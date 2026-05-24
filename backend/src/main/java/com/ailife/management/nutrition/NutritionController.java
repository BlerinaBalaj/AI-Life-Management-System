package com.ailife.management.nutrition;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
@PreAuthorize("hasAnyRole('USER','ADMIN','SUPER_ADMIN')")
public class NutritionController {
    private final NutritionService nutritionService;

    @Operation(summary = "List nutrition plans with calorie filtering")
    @GetMapping("/nutrition-plans")
    public List<Map<String, Object>> plans(@RequestParam(required = false) Integer minCalories,
                                           @RequestParam(required = false) Integer maxCalories) {
        return nutritionService.plans(minCalories, maxCalories);
    }

    @Operation(summary = "Create a nutrition plan")
    @PostMapping("/nutrition-plans")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createPlan(@RequestBody Map<String, Object> body) {
        return nutritionService.createPlan(body, false);
    }

    @Operation(summary = "Create a food log")
    @PostMapping("/food-logs")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createFoodLog(@RequestBody Map<String, Object> body) {
        return nutritionService.createFoodLog(body);
    }

    @Operation(summary = "List food logs by date range")
    @GetMapping("/food-logs")
    public List<Map<String, Object>> foodLogs(@RequestParam(required = false) LocalDateTime from,
                                              @RequestParam(required = false) LocalDateTime to) {
        return nutritionService.foodLogs(from, to);
    }
}
