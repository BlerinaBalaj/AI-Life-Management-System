package com.ailife.management.fitness;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
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
public class FitnessController {
    private final FitnessService fitnessService;

    @Operation(summary = "List workout plans with optional difficulty filtering")
    @GetMapping("/workouts")
    public List<Map<String, Object>> workoutPlans(@RequestParam(required = false) String difficulty) {
        return fitnessService.workoutPlans(difficulty);
    }

    @Operation(summary = "Create a workout plan")
    @PostMapping("/workouts")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createWorkoutPlan(@RequestBody Map<String, Object> body) {
        return fitnessService.createWorkoutPlan(body, false);
    }

    @Operation(summary = "Create a workout session")
    @PostMapping("/workout-sessions")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createWorkoutSession(@RequestBody Map<String, Object> body) {
        return fitnessService.createWorkoutSession(body);
    }

    @Operation(summary = "List workout sessions by date range")
    @GetMapping("/workout-sessions")
    public List<Map<String, Object>> sessions(@RequestParam(required = false) LocalDateTime from,
                                              @RequestParam(required = false) LocalDateTime to) {
        return fitnessService.sessions(from, to);
    }
}
