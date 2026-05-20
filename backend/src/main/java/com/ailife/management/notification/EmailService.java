package com.ailife.management.notification;

import com.ailife.management.user.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

@Slf4j
@Service
public class EmailService {
    @Async
    public void sendWeeklyReportQueuedEmail(User user) {
        log.info("Email notification queued for {}: weekly AI report generation started", user.getEmail());
    }
}
