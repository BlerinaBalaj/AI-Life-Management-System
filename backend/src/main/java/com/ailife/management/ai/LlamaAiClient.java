package com.ailife.management.ai;

import com.ailife.management.exception.ApiException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.client.ResourceAccessException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.client.RestTemplate;

import javax.annotation.PostConstruct;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class LlamaAiClient implements StructuredAiClient {
    private final RestTemplate restTemplate;
    private final ObjectMapper objectMapper;

    @Value("${llama.api-key:${GROQ_API_KEY:}}")
    private String apiKey;

    @Value("${llama.base-url:${GROQ_BASE_URL:https://api.groq.com/openai/v1}}")
    private String baseUrl;

    @Value("${llama.model:${GROQ_MODEL:llama-3.3-70b-versatile}}")
    private String model;

    @PostConstruct
    void normalizeModel() {
        if (!StringUtils.hasText(model)) {
            model = "llama-3.3-70b-versatile";
            return;
        }
        model = model.trim();
    }

    @Override
    @Cacheable(value = "aiResponses", key = "'llama:v1:' + #requestType + ':' + #cacheKey", condition = "#root.target.hasApiKey()")
    public String structuredCompletion(String requestType, String cacheKey, Map<String, Object> input) {
        if (!hasApiKey()) {
            return AiPromptSupport.localFallback(objectMapper, requestType, null);
        }

        String prompt = AiPromptSupport.buildPrompt(requestType, AiPromptSupport.toJson(objectMapper, input));
        Map<String, Object> request = new LinkedHashMap<>();
        request.put("model", model);
        request.put("temperature", 0.4);
        request.put("response_format", Map.of("type", "json_object"));
        request.put("messages", List.of(
                Map.of("role", "system", "content", AiPromptSupport.instructions(requestType)),
                Map.of("role", "user", "content", prompt)
        ));

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        if (StringUtils.hasText(apiKey)) {
            headers.setBearerAuth(apiKey.trim());
        }

        try {
            JsonNode response = restTemplate.postForObject(
                    baseUrl + "/chat/completions",
                    new HttpEntity<>(request, headers),
                    JsonNode.class);
            return extractText(response, requestType);
        } catch (RestClientResponseException ex) {
            throw new ApiException(
                    HttpStatus.BAD_GATEWAY,
                    "Llama request failed (" + ex.getRawStatusCode() + "): " + extractLlamaError(ex.getResponseBodyAsString()));
        } catch (ResourceAccessException ex) {
            throw new ApiException(
                    HttpStatus.BAD_GATEWAY,
                    "Llama endpoint could not be reached. Check LLAMA_BASE_URL/GROQ_BASE_URL and your API key.");
        }
    }

    @Override
    public String getModel() {
        return model;
    }

    @Override
    public String getProvider() {
        return "llama";
    }

    @Override
    public boolean hasApiKey() {
        return StringUtils.hasText(apiKey)
                || StringUtils.hasText(baseUrl) && (baseUrl.startsWith("http://localhost") || baseUrl.startsWith("http://127.0.0.1"));
    }

    private String extractText(JsonNode response, String requestType) {
        if (response == null) {
            return AiPromptSupport.localFallback(objectMapper, requestType, null);
        }
        JsonNode content = response.path("choices").path(0).path("message").path("content");
        if (content.isTextual() && StringUtils.hasText(content.asText())) {
            return content.asText();
        }
        return response.toString();
    }

    private String extractLlamaError(String responseBody) {
        if (!StringUtils.hasText(responseBody)) {
            return "No response body returned by the Llama endpoint.";
        }
        try {
            JsonNode root = objectMapper.readTree(responseBody);
            JsonNode message = root.path("error").path("message");
            if (message.isTextual() && StringUtils.hasText(message.asText())) {
                return message.asText();
            }
        } catch (Exception ignored) {
            // Fall through.
        }
        return responseBody.length() > 500 ? responseBody.substring(0, 500) + "..." : responseBody;
    }
}
