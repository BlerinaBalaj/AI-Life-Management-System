package com.ailife.management.notification;

import io.swagger.v3.oas.annotations.Operation;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequiredArgsConstructor
@RequestMapping("/api/notifications")
@PreAuthorize("hasAnyRole('USER','ADMIN','SUPER_ADMIN')")
public class NotificationController {
    private final NotificationService notificationService;

    @Operation(summary = "List notifications")
    @GetMapping
    public List<Map<String, Object>> list() {
        return notificationService.list();
    }

    @Operation(summary = "Mark a notification as read")
    @PutMapping("/{id}/read")
    public Map<String, Object> markRead(@PathVariable Long id) {
        return notificationService.markRead(id);
    }
}
