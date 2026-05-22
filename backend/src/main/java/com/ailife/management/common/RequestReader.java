package com.ailife.management.common;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.Map;

public final class RequestReader {
    private RequestReader() {
    }

    public static String string(Map<String, Object> body, String key) {
        Object value = body.get(key);
        return value == null ? null : String.valueOf(value);
    }

    public static String string(Map<String, Object> body, String key, String defaultValue) {
        String value = string(body, key);
        return value == null || value.isBlank() ? defaultValue : value;
    }

    public static Integer integer(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).intValue();
        }
        return Integer.valueOf(String.valueOf(value));
    }

    public static Double decimal(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).doubleValue();
        }
        return Double.valueOf(String.valueOf(value));
    }

    public static Boolean bool(Map<String, Object> body, String key, boolean defaultValue) {
        Object value = body.get(key);
        return value == null ? defaultValue : Boolean.valueOf(String.valueOf(value));
    }

    public static Long longValue(Map<String, Object> body, String key) {
        Object value = body.get(key);
        if (value == null) {
            return null;
        }
        if (value instanceof Number) {
            return ((Number) value).longValue();
        }
        return Long.valueOf(String.valueOf(value));
    }

    public static LocalDate date(Map<String, Object> body, String key) {
        String value = string(body, key);
        return value == null || value.isBlank() ? null : LocalDate.parse(value);
    }

    public static LocalDateTime dateTime(Map<String, Object> body, String key) {
        String value = string(body, key);
        return value == null || value.isBlank() ? null : LocalDateTime.parse(value);
    }

    public static LocalTime time(Map<String, Object> body, String key) {
        String value = string(body, key);
        return value == null || value.isBlank() ? null : LocalTime.parse(value);
    }
}
