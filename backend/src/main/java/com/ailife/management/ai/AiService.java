package com.ailife.management.ai;

import com.ailife.management.common.CurrentUserService;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.common.RequestReader;
import com.ailife.management.exception.ResourceNotFoundException;
import com.ailife.management.fitness.FitnessService;
import com.ailife.management.notification.EmailService;
import com.ailife.management.nutrition.NutritionService;
import com.ailife.management.planning.PlanningService;
import com.ailife.management.user.User;
import com.ailife.management.user.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.LocalDate;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiService {
    private final CurrentUserService currentUserService;
    private final StructuredAiClient aiClient;
    private final AiContextBuilder contextBuilder;
    private final AIRequestLogRepository requestLogRepository;
    private final AIReportRepository reportRepository;
    private final AIConversationRepository conversationRepository;
    private final AIMessageRepository messageRepository;
    private final PlanningService planningService;
    private final FitnessService fitnessService;
    private final NutritionService nutritionService;
    private final UserRepository userRepository;
    private final EmailService emailService;
    private final ObjectMapper objectMapper;

    @Transactional
    public Map<String, Object> chat(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        AIConversation conversation = resolveConversation(user, RequestReader.longValue(body, "conversationId"));
        String message = RequestReader.string(body, "message", "");
        saveMessage(user, conversation, "USER", message);
        if (isSmallTalk(message)) {
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("requestType", "CHATBOT");
            response.put("provider", aiClient.getProvider());
            response.put("model", aiClient.getModel());
            response.put("live", false);
            response.put("source", "local-small-talk");
            response.put("output", casualChatOutput(message));
            saveMessage(user, conversation, "AI", String.valueOf(response.get("output")));
            response.put("conversation", DtoMapper.aiConversation(conversation));
            return response;
        }
        Map<String, Object> response = execute("CHATBOT", body, user);
        saveMessage(user, conversation, "AI", String.valueOf(response.get("output")));
        response.put("conversation", DtoMapper.aiConversation(conversation));
        return response;
    }

    @Transactional
    public Map<String, Object> analyzeText(Map<String, Object> body) {
        return execute("TEXT_ANALYSIS", body, currentUserService.requireUser());
    }

    @Transactional
    public Map<String, Object> generateDailyPlan(Map<String, Object> body) {
        Map<String, Object> ai = execute("DAILY_PLAN", body, currentUserService.requireUser());
        Map<String, Object> planBody = new LinkedHashMap<>();
        planBody.put("planDate", RequestReader.string(body, "planDate", LocalDate.now().toString()));
        planBody.put("title", "AI Daily Plan");
        planBody.put("summary", displayText(ai.get("output")));
        planBody.put("aiGenerated", true);
        Map<String, Object> plan = planningService.createDailyPlan(planBody);
        ai.put("dailyPlan", plan);
        return ai;
    }

    @Transactional
    public Map<String, Object> workoutSuggestion(Map<String, Object> body) {
        Map<String, Object> ai = execute("WORKOUT_SUGGESTION", body, currentUserService.requireUser());
        Map<String, Object> planBody = new LinkedHashMap<>();
        planBody.put("title", "AI Workout Suggestion");
        planBody.put("description", displayText(ai.get("output")));
        planBody.put("difficulty", RequestReader.string(body, "difficulty", "BEGINNER"));
        Integer daysPerWeek = RequestReader.integer(body, "daysPerWeek");
        planBody.put("daysPerWeek", daysPerWeek == null ? 3 : daysPerWeek);
        ai.put("workoutPlan", fitnessService.createWorkoutPlan(planBody, true));
        return ai;
    }

    @Transactional
    public Map<String, Object> nutritionSuggestion(Map<String, Object> body) {
        Map<String, Object> ai = execute("NUTRITION_SUGGESTION", body, currentUserService.requireUser());
        Map<String, Object> planBody = new LinkedHashMap<>();
        planBody.put("title", "AI Nutrition Suggestion");
        planBody.put("description", displayText(ai.get("output")));
        planBody.put("dailyCalories", RequestReader.integer(body, "dailyCalories"));
        ai.put("nutritionPlan", nutritionService.createPlan(planBody, true));
        return ai;
    }

    @Transactional
    public Map<String, Object> moodAnalysis(Map<String, Object> body) {
        return execute("MOOD_ANALYSIS", body, currentUserService.requireUser());
    }

    @Transactional
    public Map<String, Object> weeklyReport(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        Map<String, Object> ai = execute("WEEKLY_REPORT", body, user);
        LocalDate start = LocalDate.now().minusDays(7);
        LocalDate end = LocalDate.now();
        AIReport report = reportRepository.findByUserIdAndTenantIdAndReportTypeAndPeriodStartAndPeriodEnd(
                        user.getId(), user.getTenant().getId(), "WEEKLY", start, end)
                .orElseGet(() -> {
                    AIReport newReport = new AIReport();
                    newReport.setTenant(user.getTenant());
                    newReport.setUser(user);
                    newReport.setPeriodStart(start);
                    newReport.setPeriodEnd(end);
                    newReport.setReportType("WEEKLY");
                    return newReport;
                });
        report.setStatus("READY");
        report.setContentJson(String.valueOf(ai.get("output")));
        ai.put("report", DtoMapper.aiReport(reportRepository.save(report)));
        return ai;
    }

    @Async
    @Transactional
    public void generateWeeklyReportAsync(Long userId) {
        User user;
        try {
            user = currentUserServiceForBackground(userId);
        } catch (Exception ex) {
            log.error("[AI Background] User {} not found: {}", userId, ex.getMessage());
            return;
        }

        LocalDate start = LocalDate.now().minusDays(7);
        LocalDate end = LocalDate.now();
        String content;

        try {
            Map<String, Object> input = Map.of("reason", "scheduled-background-job");
            Map<String, Object> response = execute("WEEKLY_REPORT_BACKGROUND", input, user);
            content = String.valueOf(response.get("output"));
        } catch (Exception ex) {
            String reason = ex.getMessage() != null && ex.getMessage().contains("429") ? "rate limit" : ex.getMessage();
            log.warn("[AI Background] AI generation failed for user {} ({}) — {} — duke dërguar fallback email.",
                    user.getId(), user.getEmail(), reason);
            content = "{\"summary\":\"Your weekly report could not be generated automatically this week. "
                    + "Please open the AI Reports section to generate it manually.\",\"insights\":[]}";
        }

        try {
            AIReport report = reportRepository.findByUserIdAndTenantIdAndReportTypeAndPeriodStartAndPeriodEnd(
                            user.getId(), user.getTenant().getId(), "WEEKLY_BACKGROUND", start, end)
                    .orElseGet(() -> {
                        AIReport newReport = new AIReport();
                        newReport.setTenant(user.getTenant());
                        newReport.setUser(user);
                        newReport.setPeriodStart(start);
                        newReport.setPeriodEnd(end);
                        newReport.setReportType("WEEKLY_BACKGROUND");
                        return newReport;
                    });
            report.setStatus("READY");
            report.setContentJson(content);
            reportRepository.save(report);
        } catch (Exception ex) {
            log.error("[AI Background] Failed to save report for user {}: {}", user.getId(), ex.getMessage());
        }

        // Dërgo email gjithmonë — edhe nëse AI dështoi
        emailService.sendWeeklyReportReadyEmail(user, content);
    }

    private User currentUserServiceForBackground(Long userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found for background AI job"));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> reports() {
        User user = currentUserService.requireUser();
        return reportRepository.findByUserIdAndTenantIdOrderByPeriodEndDesc(user.getId(), user.getTenant().getId())
                .stream()
                .map(DtoMapper::aiReport)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> report(Long id) {
        User user = currentUserService.requireUser();
        return reportRepository.findByIdAndUserIdAndTenantId(id, user.getId(), user.getTenant().getId())
                .map(DtoMapper::aiReport)
                .orElseThrow(() -> new ResourceNotFoundException("AI report not found"));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> history() {
        User user = currentUserService.requireUser();
        return requestLogRepository.findTop20ByUserIdAndTenantIdOrderByCreatedAtDesc(user.getId(), user.getTenant().getId())
                .stream()
                .map(DtoMapper::aiLog)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> conversations() {
        User user = currentUserService.requireUser();
        return conversationRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId())
                .stream()
                .map(DtoMapper::aiConversation)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> messages(Long conversationId) {
        User user = currentUserService.requireUser();
        return messageRepository.findByConversationIdAndUserIdAndTenantIdOrderByCreatedAtAsc(conversationId, user.getId(), user.getTenant().getId())
                .stream()
                .map(DtoMapper::aiMessage)
                .collect(Collectors.toList());
    }

    private Map<String, Object> execute(String requestType, Map<String, Object> body, User user) {
        Map<String, Object> context = contextBuilder.build(user, body);
        String inputJson = toJson(context);
        String cacheKey = hash(inputJson);
        if (shouldBypassStableCache(requestType)) {
            cacheKey = hash(inputJson + "|" + System.currentTimeMillis());
        }
        String outputJson = "";
        boolean success = false;
        String error = null;
        try {
            outputJson = aiClient.structuredCompletion(requestType, cacheKey, context);
            success = true;
            boolean live = aiClient.hasApiKey() && !isLocalFallbackOutput(outputJson);
            Map<String, Object> response = new LinkedHashMap<>();
            response.put("requestType", requestType);
            response.put("provider", aiClient.getProvider());
            response.put("model", aiClient.getModel());
            response.put("live", live);
            response.put("source", live ? "ai" : "local-fallback");
            response.put("output", outputJson);
            return response;
        } catch (Exception ex) {
            error = ex.getMessage();
            throw ex;
        } finally {
            AIRequestLog requestLog = new AIRequestLog();
            requestLog.setTenant(user.getTenant());
            requestLog.setUser(user);
            requestLog.setRequestType(requestType);
            requestLog.setModel(aiClient.getProvider() + ":" + aiClient.getModel());
            requestLog.setInputJson(inputJson);
            requestLog.setOutputJson(outputJson);
            requestLog.setSuccessful(success);
            requestLog.setErrorMessage(error);
            requestLogRepository.save(requestLog);
        }
    }

    private AIConversation resolveConversation(User user, Long conversationId) {
        if (conversationId != null) {
            return conversationRepository.findByIdAndUserIdAndTenantId(conversationId, user.getId(), user.getTenant().getId())
                    .orElseThrow(() -> new ResourceNotFoundException("AI conversation not found"));
        }
        AIConversation conversation = new AIConversation();
        conversation.setTenant(user.getTenant());
        conversation.setUser(user);
        conversation.setTitle("Life assistant");
        conversation.setChannel("CHATBOT");
        return conversationRepository.save(conversation);
    }

    private void saveMessage(User user, AIConversation conversation, String sender, String content) {
        AIMessage message = new AIMessage();
        message.setTenant(user.getTenant());
        message.setUser(user);
        message.setConversation(conversation);
        message.setSender(sender);
        message.setContent(content);
        messageRepository.save(message);
    }

    private String toJson(Object value) {
        try {
            return objectMapper.writeValueAsString(value);
        } catch (Exception ex) {
            return "{}";
        }
    }

    private boolean shouldBypassStableCache(String requestType) {
        return requestType != null && (
                requestType.startsWith("WEEKLY")
                        || "MOOD_ANALYSIS".equals(requestType)
                        || "DAILY_PLAN".equals(requestType)
                        || "WORKOUT_SUGGESTION".equals(requestType)
                        || "NUTRITION_SUGGESTION".equals(requestType)
        );
    }

    private boolean isSmallTalk(String message) {
        if (message == null) {
            return true;
        }
        String normalized = message.trim().toLowerCase();
        return normalized.matches("^(hi|hello|hey|yo|sup|pershendetje|p[e\\u00EB]rsh[e\\u00EB]ndetje|tung|ckemi|\\u00E7kemi|qkemi|hey there)[!. ]*$");
    }

    private String casualChatOutput(String message) {
        String normalized = message == null ? "" : message.trim().toLowerCase();
        String summary = normalized.matches("^(hi|hello|hey|yo|sup|pershendetje|p[e\\u00EB]rsh[e\\u00EB]ndetje|tung|ckemi|\\u00E7kemi|qkemi|hey there)[!. ]*$")
                ? "Hi. I'm here. We can talk normally, or you can ask me about your goals, tasks, mood, food, or workouts whenever you want."
                : "Of course. We can just talk. What's on your mind?";
        return "{\"summary\":\"" + summary.replace("\"", "\\\"") + "\",\"recommendations\":[],\"tasks\":[],\"insights\":[]}";
    }

    private boolean isLocalFallbackOutput(String outputJson) {
        return outputJson != null && outputJson.contains("Local AI fallback");
    }

    private String displayText(Object output) {
        String value = String.valueOf(output == null ? "" : output);
        try {
            Map<?, ?> parsed = objectMapper.readValue(value, Map.class);
            Object summary = parsed.get("summary");
            if (summary != null && !String.valueOf(summary).trim().isEmpty()) {
                return String.valueOf(summary);
            }
        } catch (Exception ignored) {
            // Keep the original value when it is already plain text.
        }
        return value;
    }

    private String hash(String value) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] bytes = digest.digest(value.getBytes(StandardCharsets.UTF_8));
            StringBuilder builder = new StringBuilder(bytes.length * 2);
            for (byte b : bytes) {
                builder.append(String.format("%02x", b));
            }
            return builder.toString();
        } catch (Exception ex) {
            return String.valueOf(value.hashCode());
        }
    }
}
