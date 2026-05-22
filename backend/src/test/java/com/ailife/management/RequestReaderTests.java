package com.ailife.management;

import com.ailife.management.common.RequestReader;
import org.junit.jupiter.api.Test;

import java.time.LocalDate;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

class RequestReaderTests {
    @Test
    void parsesCommonRequestValues() {
        Map<String, Object> body = Map.of(
                "name", "Focus",
                "count", 3,
                "date", "2026-05-12"
        );

        assertThat(RequestReader.string(body, "name")).isEqualTo("Focus");
        assertThat(RequestReader.integer(body, "count")).isEqualTo(3);
        assertThat(RequestReader.date(body, "date")).isEqualTo(LocalDate.of(2026, 5, 12));
    }
}
