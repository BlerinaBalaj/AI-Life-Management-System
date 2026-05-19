package com.ailife.management.ai;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/ai")
public class AiController {
    private final AiService aiService;

    @Operation(summary = "Bounded chatbot endpoint that uses life-management data")
    @PostMapping("/chat")
    public Map<String, Object> chat(@RequestBody Map<String, Object> body) {
        return aiService.chat(body);
    }

    @Operation(summary = "Analyze text such as a journal or reflection")
    @PostMapping("/analyze-text")
    public Map<String, Object> analyzeText(@RequestBody Map<String, Object> body) {
        return aiService.analyzeText(body);
    }

    @Operation(summary = "Generate an AI daily plan")
    @PostMapping("/daily-plan")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> dailyPlan(@RequestBody Map<String, Object> body) {
        return aiService.generateDailyPlan(body);
    }

    @Operation(summary = "Generate AI workout suggestions")
    @PostMapping("/workout-suggestion")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> workoutSuggestion(@RequestBody Map<String, Object> body) {
        return aiService.workoutSuggestion(body);
    }

    @Operation(summary = "Generate AI nutrition suggestions")
    @PostMapping("/nutrition-suggestion")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> nutritionSuggestion(@RequestBody Map<String, Object> body) {
        return aiService.nutritionSuggestion(body);
    }

    @Operation(summary = "Analyze mood and stress history")
    @PostMapping("/mood-analysis")
    public Map<String, Object> moodAnalysis(@RequestBody Map<String, Object> body) {
        return aiService.moodAnalysis(body);
    }

    @Operation(summary = "Generate a weekly AI report")
    @PostMapping("/weekly-report")
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> weeklyReport(@RequestBody Map<String, Object> body) {
        return aiService.weeklyReport(body);
    }

    @Operation(summary = "List AI reports")
    @GetMapping("/reports")
    public List<Map<String, Object>> reports() {
        return aiService.reports();
    }

    @Operation(summary = "Get one AI report")
    @GetMapping("/reports/{id}")
    public Map<String, Object> report(@PathVariable Long id) {
        return aiService.report(id);
    }

    @Operation(summary = "List AI request history")
    @GetMapping("/history")
    public List<Map<String, Object>> history() {
        return aiService.history();
    }

    @Operation(summary = "List AI chatbot conversations")
    @GetMapping("/conversations")
    public List<Map<String, Object>> conversations() {
        return aiService.conversations();
    }

    @Operation(summary = "List messages for a chatbot conversation")
    @GetMapping("/conversations/{id}/messages")
    public List<Map<String, Object>> messages(@PathVariable Long id) {
        return aiService.messages(id);
    }
}
