package com.ailife.management.ai;

import com.ailife.management.notification.NotificationService;
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

    /**
     * Kontrollon nëse email-i duket real: jo .test/.local, local-part >= 3 karaktere,
     * dhe domain ka TLD me të paktën 2 karaktere.
     */
    private static boolean isRealEmail(User user) {
        String email = user.getEmail();
        if (email == null) return false;
        String lower = email.toLowerCase();
        if (lower.endsWith(".test") || lower.endsWith(".local")) return false;
        int atIdx = lower.indexOf('@');
        if (atIdx < 1) return false;                          // kërkon të paktën 1 karakter para @
        String domain = lower.substring(atIdx + 1);
        int dotIdx = domain.lastIndexOf('.');
        if (dotIdx < 1) return false;
        String tld = domain.substring(dotIdx + 1);
        return tld.length() >= 2;                             // TLD valid (com, net, org, al, ...)
    }

    // Çdo të diel ora 20:00
    @Scheduled(cron = "0 0 20 * * SUN")
    @Transactional
    public void scheduleWeeklyReports() {
        userRepository.findAll().stream()
                .filter(User::isEnabled)
                .filter(AiBackgroundJob::isRealEmail)
                .forEach(user -> {
                    log.info("Queueing weekly AI report for user {}", user.getId());
                    aiService.generateWeeklyReportAsync(user.getId());
                    notificationService.create(user, "Weekly AI report", "Your weekly life-management report is being generated.", "IN_APP");
                    try {
                        Thread.sleep(2000); // Prit 2s ndërmjet users për të shmangur rate limit
                    } catch (InterruptedException e) {
                        Thread.currentThread().interrupt();
                    }
                });
    }
}
