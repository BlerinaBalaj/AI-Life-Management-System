package com.ailife.management.notification;

import com.ailife.management.user.User;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.MailException;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import com.fasterxml.jackson.databind.ObjectMapper;
import javax.mail.MessagingException;
import javax.mail.internet.MimeMessage;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Map;

/**
 * Shërbimi për dërgimin e email-eve.
 * Nëse MAIL_USERNAME nuk është konfiguruar, operacioni kryhet si log-only (dev mode).
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender mailSender;
    private final ObjectMapper objectMapper;

    @Value("${spring.mail.username:}")
    private String fromAddress;

    /**
     * Dërgon email me përmbajtjen e plotë të raportit javor pasi AI e gjeneron.
     */
    @Async
    public void sendWeeklyReportReadyEmail(User user, String contentJson) {
        if (!isConfigured()) {
            log.info("[EmailService] MAIL_USERNAME nuk është konfiguruar — raporti javor nuk u dërgua për {}", user.getEmail());
            return;
        }

        String week = LocalDate.now().format(DateTimeFormatter.ofPattern("MMM d, yyyy"));
        String subject = "Your weekly AI life report is ready — " + week;
        String html = buildWeeklyReportReadyHtml(user.getFullName(), week, contentJson);
        send(user.getEmail(), subject, html);
    }

    /**
     * Dërgon email mirëseardhje kur një user i ri regjistrohet.
     */
    @Async
    public void sendWelcomeEmail(User user) {
        if (!isConfigured()) {
            log.info("[EmailService] MAIL_USERNAME nuk është konfiguruar — email mirëseardhjeje nuk u dërgua për {}", user.getEmail());
            return;
        }

        String subject = "Welcome to AI Life Management, " + user.getFullName() + "!";
        String html = buildWelcomeHtml(user.getFullName());
        send(user.getEmail(), subject, html);
    }

    // ── Internal helpers ──────────────────────────────────────────────────────

    private void send(String to, String subject, String htmlBody) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setFrom(fromAddress);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlBody, true);
            mailSender.send(message);
            log.info("[EmailService] Email u dërgua me sukses te {}: {}", to, subject);
        } catch (MessagingException | MailException ex) {
            log.error("[EmailService] Dërgimi i email-it dështoi te {}: {}", to, ex.getMessage());
        }
    }

    private boolean isConfigured() {
        return StringUtils.hasText(fromAddress);
    }

    // ── HTML templates ────────────────────────────────────────────────────────

    @SuppressWarnings("unchecked")
    private String buildWeeklyReportReadyHtml(String fullName, String week, String contentJson) {
        String summary = "Your weekly report is ready.";
        StringBuilder insightsHtml = new StringBuilder();

        try {
            Map<String, Object> parsed = objectMapper.readValue(contentJson, Map.class);
            Object s = parsed.get("summary");
            if (s != null && !String.valueOf(s).isBlank()) {
                summary = String.valueOf(s);
            }
            Object ins = parsed.get("insights");
            if (ins instanceof List) {
                for (Object item : (List<?>) ins) {
                    insightsHtml.append("<li style=\"margin-bottom:6px\">").append(escapeHtml(String.valueOf(item))).append("</li>");
                }
            }
        } catch (Exception ignored) {
            summary = contentJson.length() > 300 ? contentJson.substring(0, 300) + "…" : contentJson;
        }

        return "<!DOCTYPE html><html><body style=\"font-family:sans-serif;max-width:560px;margin:auto;color:#1a1a2e\">"
                + "<div style=\"background:#6366f1;padding:24px 32px;border-radius:8px 8px 0 0\">"
                + "<h2 style=\"color:#fff;margin:0\">AI Life Management — Weekly Report</h2>"
                + "</div>"
                + "<div style=\"background:#f8f8ff;padding:28px 32px;border-radius:0 0 8px 8px\">"
                + "<p>Hi <strong>" + escapeHtml(fullName) + "</strong>,</p>"
                + "<p>Your weekly AI life report for <strong>" + escapeHtml(week) + "</strong> is ready.</p>"
                + "<div style=\"background:#fff;border-left:4px solid #6366f1;padding:16px 20px;border-radius:4px;margin:16px 0\">"
                + "<p style=\"margin:0 0 8px 0;font-weight:600\">Summary</p>"
                + "<p style=\"margin:0;line-height:1.6\">" + escapeHtml(summary) + "</p>"
                + "</div>"
                + (insightsHtml.length() > 0
                    ? "<p style=\"font-weight:600;margin-bottom:8px\">Key Insights</p>"
                      + "<ul style=\"padding-left:20px;line-height:1.6\">" + insightsHtml + "</ul>"
                    : "")
                + "<p style=\"margin-top:24px\">Open your <strong>AI Reports</strong> section for the full breakdown.</p>"
                + "<br><p style=\"color:#6b7280;font-size:13px\">AI Life Management — automated weekly digest.</p>"
                + "</div></body></html>";
    }

    private String buildWelcomeHtml(String fullName) {
        return "<!DOCTYPE html><html><body style=\"font-family:sans-serif;max-width:520px;margin:auto;color:#1a1a2e\">"
                + "<div style=\"background:#6366f1;padding:24px 32px;border-radius:8px 8px 0 0\">"
                + "<h2 style=\"color:#fff;margin:0\">Welcome to AI Life Management</h2>"
                + "</div>"
                + "<div style=\"background:#f8f8ff;padding:28px 32px;border-radius:0 0 8px 8px\">"
                + "<p>Hi <strong>" + escapeHtml(fullName) + "</strong>, mirë se erdhe! 🎉</p>"
                + "<p>Llogaria jote është gati. Mund të fillosh të menaxhosh:</p>"
                + "<ul>"
                + "<li>🎯 Qëllimet dhe Detyrat</li>"
                + "<li>🏋️ Fitnesin dhe Stërvitjet</li>"
                + "<li>🥗 Ushqimin dhe Kalorinë</li>"
                + "<li>😊 Humorin dhe Stresin</li>"
                + "<li>🤖 Raportet dhe Chatbotin me AI</li>"
                + "</ul>"
                + "<br><p style=\"color:#6b7280;font-size:13px\">AI Life Management System</p>"
                + "</div></body></html>";
    }

    private String escapeHtml(String value) {
        if (value == null) return "";
        return value.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace("\"", "&quot;");
    }
}
