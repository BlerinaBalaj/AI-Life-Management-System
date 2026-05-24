package com.ailife.management.user;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/users")
@PreAuthorize("hasAnyRole('USER','ADMIN','SUPER_ADMIN')")
public class UserController {
    private final UserService userService;

    @Operation(summary = "Get the authenticated user profile")
    @GetMapping("/me")
    public Map<String, Object> me() {
        return userService.me();
    }

    @Operation(summary = "Update the authenticated user profile")
    @PutMapping("/me")
    public Map<String, Object> updateMe(@RequestBody Map<String, Object> body) {
        return userService.updateMe(body);
    }

    @Operation(summary = "List authenticated user preferences")
    @GetMapping("/me/preferences")
    public List<Map<String, Object>> preferences() {
        return userService.preferences();
    }

    @Operation(summary = "Create a user preference")
    @PostMapping("/me/preferences")
    public Map<String, Object> createPreference(@RequestBody Map<String, Object> body) {
        return userService.upsertPreference(body);
    }
}
