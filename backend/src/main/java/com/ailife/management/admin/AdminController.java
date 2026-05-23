package com.ailife.management.admin;

import com.ailife.management.user.UserService;
import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/admin")
public class AdminController {
    private final UserService userService;

    @Operation(summary = "List users inside the current tenant")
    @GetMapping("/users")
    public List<Map<String, Object>> users() {
        return userService.adminUsers();
    }

    @Operation(summary = "Change a user's role inside the current tenant")
    @PutMapping("/users/{id}/role")
    public Map<String, Object> changeRole(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return userService.changeRole(id, String.valueOf(body.getOrDefault("role", "USER")));
    }

    @Operation(summary = "Disable a user inside the current tenant")
    @DeleteMapping("/users/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void disable(@PathVariable Long id) {
        userService.disableUser(id);
    }
    
    @Operation(summary = "Hard delete a user from the system")
    @DeleteMapping("/users/{id}/hard")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        userService.deleteUser(id);
    }
}
