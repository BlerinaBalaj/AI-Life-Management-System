package com.ailife.management.ai;

import com.ailife.management.notification.NotificationService;
import com.ailife.management.notification.EmailService;
import com.ailife.management.user.User;
import com.ailife.management.user.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Component
@RequiredArgsConstructor
public class AiBackgroundJob {
    private final UserRepository userRepository;
    private final AiService aiService;
    private final NotificationService notificationService;
    private final EmailService emailService;

    @Scheduled(cron = "0 0 6 * * MON")
    @Transactional
    public void scheduleWeeklyReports() {
        userRepository.findAll().stream()
                .filter(User::isEnabled)
                .forEach(user -> {
                    log.info("Queueing weekly AI report for user {}", user.getId());
                    aiService.generateWeeklyReportAsync(user.getId());
                    notificationService.create(user, "Weekly AI report", "Your weekly life-management report is being generated.", "IN_APP");
                    emailService.sendWeeklyReportQueuedEmail(user);
                });
    }
}
