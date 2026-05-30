package com.ailife.management.common;

import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

/**
 * Wrapper i standardizuar për lista me pagination.
 * Kur page=-1 (ose nuk jepet), klienti merr të gjitha të dhënat (backward-compatible).
 */
public final class PagedResponse {

    private PagedResponse() {}

    /**
     * Nderto përgjigjen e paginuar.
     *
     * @param content  lista e elementeve për faqen aktuale
     * @param page     indeksi i faqes (0-based)
     * @param size     madhësia e faqes
     * @param total    numri total i elementeve
     */
    public static Map<String, Object> of(List<Map<String, Object>> content, int page, int size, long total) {
        long totalPages = size > 0 ? (long) Math.ceil((double) total / size) : 1L;
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("content", content);
        result.put("page", page);
        result.put("size", size > 0 ? size : total);
        result.put("totalElements", total);
        result.put("totalPages", totalPages);
        result.put("first", page == 0);
        result.put("last", page >= totalPages - 1);
        return result;
    }
}
