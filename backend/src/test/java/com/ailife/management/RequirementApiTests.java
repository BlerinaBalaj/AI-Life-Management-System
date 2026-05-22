package com.ailife.management;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import java.util.UUID;

import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.hamcrest.Matchers.everyItem;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@ActiveProfiles("test")
@AutoConfigureMockMvc
@SpringBootTest
class RequirementApiTests {
    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    void jwtRbacTenantIsolationAndSearchFilteringWorkTogether() throws Exception {
        Registration userA = register("audit-a");
        Registration userB = register("audit-b");

        mockMvc.perform(get("/api/admin/users")
                        .header("Authorization", bearer(userA.token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$[*].tenantId", everyItem(is(userA.tenantId.intValue()))));

        mockMvc.perform(post("/api/tasks")
                        .header("Authorization", bearer(userA.token))
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{"
                                + "\"title\":\"Deep work planning\","
                                + "\"description\":\"Prepare architecture review\","
                                + "\"status\":\"TODO\","
                                + "\"priority\":2,"
                                + "\"dueDate\":\"2026-05-18\""
                                + "}"))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.title", is("Deep work planning")));

        mockMvc.perform(get("/api/tasks")
                        .header("Authorization", bearer(userB.token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(0)));

        mockMvc.perform(get("/api/search/tasks")
                        .param("query", "deep")
                        .param("status", "TODO")
                        .header("Authorization", bearer(userA.token)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$", hasSize(1)))
                .andExpect(jsonPath("$[0].title", is("Deep work planning")));
    }

    private Registration register(String prefix) throws Exception {
        String suffix = UUID.randomUUID().toString().substring(0, 8);
        String email = prefix + "-" + suffix + "@example.com";
        String payload = "{"
                + "\"fullName\":\"Audit User\","
                + "\"email\":\"" + email + "\","
                + "\"password\":\"Password123!\","
                + "\"tenantName\":\"" + prefix + "-" + suffix + "\""
                + "}";

        String body = mockMvc.perform(post("/api/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(payload))
                .andExpect(status().isCreated())
                .andReturn()
                .getResponse()
                .getContentAsString();

        JsonNode root = objectMapper.readTree(body);
        return new Registration(root.path("accessToken").asText(), root.path("tenantId").asLong());
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    private static class Registration {
        private final String token;
        private final Long tenantId;

        private Registration(String token, Long tenantId) {
            this.token = token;
            this.tenantId = tenantId;
        }
    }
}
