package com.ailife.management.notification;

import com.ailife.management.common.CurrentUserService;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.exception.ResourceNotFoundException;
import com.ailife.management.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class NotificationService {
    private final CurrentUserService currentUserService;
    private final NotificationRepository notificationRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list() {
        User user = currentUserService.requireUser();
        return notificationRepository.findByUserIdAndTenantIdOrderByCreatedAtDesc(user.getId(), user.getTenant().getId())
                .stream()
                .map(DtoMapper::notification)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> markRead(Long id) {
        User user = currentUserService.requireUser();
        Notification notification = notificationRepository.findByIdAndUserIdAndTenantId(id, user.getId(), user.getTenant().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found"));
        notification.setReadFlag(true);
        return DtoMapper.notification(notificationRepository.save(notification));
    }

    @Transactional
    public Notification create(User user, String title, String message, String channel) {
        Notification notification = new Notification();
        notification.setTenant(user.getTenant());
        notification.setUser(user);
        notification.setTitle(title);
        notification.setMessage(message);
        notification.setChannel(channel);
        return notificationRepository.save(notification);
    }
}
