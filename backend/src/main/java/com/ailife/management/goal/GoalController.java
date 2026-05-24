package com.ailife.management.goal;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/goals")
@PreAuthorize("hasAnyRole('USER','ADMIN','SUPER_ADMIN')")
public class GoalController {
    private final GoalService goalService;

    @Operation(summary = "List goals with optional status filtering")
    @GetMapping
    public List<Map<String, Object>> list(@RequestParam(required = false) String status) {
        return goalService.list(status);
    }

    @Operation(summary = "Create a goal")
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Map<String, Object> create(@RequestBody Map<String, Object> body) {
        return goalService.create(body);
    }

    @Operation(summary = "Update a goal")
    @PutMapping("/{id}")
    public Map<String, Object> update(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        return goalService.update(id, body);
    }

    @Operation(summary = "Delete a goal")
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable Long id) {
        goalService.delete(id);
    }
}
