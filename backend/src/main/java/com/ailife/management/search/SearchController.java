package com.ailife.management.search;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/search")
public class SearchController {
    private final SearchService searchService;

    @Operation(summary = "Search and filter tasks")
    @GetMapping("/tasks")
    public List<Map<String, Object>> tasks(@RequestParam(required = false) String query,
                                           @RequestParam(required = false) String status) {
        return searchService.tasks(query, status);
    }

    @Operation(summary = "Search and filter workout plans")
    @GetMapping("/workouts")
    public List<Map<String, Object>> workouts(@RequestParam(required = false) String query,
                                              @RequestParam(required = false) String difficulty) {
        return searchService.workouts(query, difficulty);
    }

    @Operation(summary = "Search and filter nutrition plans")
    @GetMapping("/nutrition")
    public List<Map<String, Object>> nutrition(@RequestParam(required = false) String query,
                                               @RequestParam(required = false) Integer maxCalories) {
        return searchService.nutrition(query, maxCalories);
    }

    @Operation(summary = "Search and filter mood logs")
    @GetMapping("/mood-logs")
    public List<Map<String, Object>> moods(@RequestParam(required = false) Integer minScore) {
        return searchService.moods(minScore);
    }

    @Operation(summary = "Search and filter AI reports")
    @GetMapping("/ai-reports")
    public List<Map<String, Object>> aiReports(@RequestParam(required = false) String type) {
        return searchService.aiReports(type);
    }
}
