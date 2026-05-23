package com.ailife.management.wellbeing;

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

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api")
public class WellbeingController {
    private final WellbeingService wellbeingService;

    @Operation(summary = "List mood logs with score filtering")
    @GetMapping("/mood-logs")
    public List<Map<String, Object>> moodLogs(@RequestParam(required = false) Integer minScore,
                                              @RequestParam(required = false) Integer maxScore) {
        return wellbeingService.moodLogs(minScore, maxScore);
    }

    @Operation(summary = "Create a mood log")
    @PostMapping("/mood-logs")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createMoodLog(@RequestBody Map<String, Object> body) {
        return wellbeingService.createMoodLog(body);
    }

    @Operation(summary = "List stress logs")
    @GetMapping("/stress-logs")
    public List<Map<String, Object>> stressLogs() {
        return wellbeingService.stressLogs();
    }

    @Operation(summary = "Create a stress log")
    @PostMapping("/stress-logs")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> createStressLog(@RequestBody Map<String, Object> body) {
        return wellbeingService.createStressLog(body);
    }
}
