package com.ailife.management.planning;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/daily-plans")
@PreAuthorize("hasAnyRole('USER','ADMIN','SUPER_ADMIN')")
public class DailyPlanController {
    private final PlanningService planningService;

    @Operation(summary = "List daily plans")
    @GetMapping
    public List<Map<String, Object>> list() {
        return planningService.dailyPlans();
    }

    @Operation(summary = "Create a daily plan")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        return planningService.createDailyPlan(body);
    }

    @Operation(summary = "Update a daily plan")
    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return planningService.updateDailyPlan(id, body);
    }
}
