package com.ailife.management.ai;

import java.util.Map;

public interface StructuredAiClient {
    String structuredCompletion(String requestType, String cacheKey, Map<String, Object> input);

    String getModel();

    String getProvider();

    boolean hasApiKey();
}
