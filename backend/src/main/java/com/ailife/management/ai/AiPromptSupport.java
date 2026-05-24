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
        String mode = "CHATBOT".equals(requestType)
                ? "For chat, respond like a calm human assistant in a normal conversation about anything this app supports: wellbeing, stress, goals, tasks, habits, planning, workouts, food, motivation, or daily life. Do not force every answer into a data recap. If the person says they do not feel good, respond with empathy first, ask one gentle follow-up, and offer one tiny grounding step. Use life data only when it helps the conversation. Answer in the summary field; do not add recommendations, tasks, insights, or extra sections unless asked. "
                : "";
        String moodMode = "MOOD_ANALYSIS".equals(requestType)
                ? "For mood or stress analysis, sound warm and emotionally intelligent. Speak directly to the person as 'you'. Do not say 'the user', 'the system', or 'based on the user's'. Start with the clearest emotional pattern, then give one grounded next step. If a log looks contradictory, mention it gently instead of over-explaining. "
                : "";
        return "You are a supportive AI life coach inside a personal life management app. "
                + "Use ONLY the user data JSON below; do not invent goals, moods, or tasks that are not present. "
                + "Write directly to the person using 'you' and 'your'. Never refer to them as 'the user'. Never say 'the system suggests'. "
                + "Keep the tone human, calm, and specific. Avoid robotic phrases like 'Based on the user's data' or long database-style recaps. "
                + "When data exists, cite only the most relevant concrete details, not every record. "
                + "When a list is empty, say so simply and give one practical next step for that area. "
                + "Avoid generic fitness or wellness boilerplate unless it directly follows from the logs. "
                + "For non-chat requests, make the summary useful but readable: 1 to 3 short paragraphs with patterns and practical next steps. "
                + moodMode
                + mode
                + "Request type: " + requestType + ". "
                + "Respond with JSON only, no markdown fences.";
    }

    static String buildPrompt(String requestType, String inputJson) {
        if ("CHATBOT".equals(requestType)) {
            return instructions(requestType)
                    + "\n\nRequired JSON schema:\n"
                    + "{\n"
                    + "  \"summary\": \"direct, conversational answer\",\n"
                    + "  \"recommendations\": [],\n"
                    + "  \"tasks\": [],\n"
                    + "  \"insights\": []\n"
                    + "}\n\n"
                    + "User data:\n"
                    + inputJson;
        }
        return instructions(requestType)
                + "\n\nRequired JSON schema:\n"
                + "{\n"
                + "  \"summary\": \"1 to 3 short, specific paragraphs written directly to the person\",\n"
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
                    : "I could not reach the live AI provider yet, but your app data is still available. Check the AI provider settings, then try again.");
            fallback.put("recommendations", List.of(
                    "Pick one priority that would make today feel lighter.",
                    "Add one short recovery break before the next demanding task.",
                    "Keep mood, food, and movement logs simple enough that you can actually maintain them."
            ));
            fallback.put("tasks", List.of("Choose one priority", "Log one check-in", "Take a short reset break"));
            fallback.put("insights", List.of("The assistant can give better guidance when recent logs include context, not only scores."));
            return objectMapper.writeValueAsString(fallback);
        } catch (Exception ex) {
            return "{\"summary\":\"I could not generate an AI response right now.\",\"recommendations\":[],\"tasks\":[],\"insights\":[]}";
        }
    }
}
