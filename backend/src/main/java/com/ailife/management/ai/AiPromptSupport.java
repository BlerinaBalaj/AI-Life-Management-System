package com.ailife.management.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.util.StringUtils;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

final class AiPromptSupport {
    private AiPromptSupport() {
    }

    static String instructions(String requestType) {
        return "You are the AI engine of an AI Personal Life Management System. "
                + "Use ONLY the user data JSON below — do not invent goals, moods, or tasks that are not present. "
                + "When data exists, cite concrete details (goal titles, task names, mood labels/scores, dates). "
                + "When a list is empty, say so and give one practical next step for that area. "
                + "Avoid generic fitness boilerplate unless it directly follows from the user's logs. "
                + "Request type: " + requestType + ". "
                + "Respond with JSON only, no markdown fences.";
    }

    static String buildPrompt(String requestType, String inputJson) {
        return instructions(requestType)
                + "\n\nRequired JSON schema:\n"
                + "{\n"
                + "  \"summary\": \"string\",\n"
                + "  \"recommendations\": [\"string\"],\n"
                + "  \"tasks\": [\"string\"],\n"
                + "  \"insights\": [\"string\"]\n"
                + "}\n\n"
                + "User data:\n"
                + inputJson;
    }

    static String toJson(ObjectMapper objectMapper, Map<String, Object> input) {
        try {
            return objectMapper.writeValueAsString(input);
        } catch (Exception ex) {
            throw new IllegalStateException("Failed to serialize AI input", ex);
        }
    }

    static String localFallback(ObjectMapper objectMapper, String requestType, String summaryOverride) {
        try {
            Map<String, Object> fallback = new LinkedHashMap<>();
            fallback.put("summary", StringUtils.hasText(summaryOverride)
                    ? summaryOverride
                    : "Local AI fallback for " + requestType + ". Configure LLAMA_BASE_URL, LLAMA_MODEL, and LLAMA_API_KEY when your Llama endpoint requires a key.");
            fallback.put("recommendations", List.of(
                    "Review today's highest-priority goal.",
                    "Plan one focused work block and one recovery break.",
                    "Keep nutrition, movement, and mood logs updated."
            ));
            fallback.put("tasks", List.of("Prioritize goals", "Log mood", "Complete fitness activity"));
            fallback.put("insights", List.of("Structured history is available to the AI engine.", "Tenant isolation is enforced by backend queries."));
            return objectMapper.writeValueAsString(fallback);
        } catch (Exception ex) {
            return "{\"summary\":\"Local fallback\",\"recommendations\":[],\"tasks\":[],\"insights\":[]}";
        }
    }
}
