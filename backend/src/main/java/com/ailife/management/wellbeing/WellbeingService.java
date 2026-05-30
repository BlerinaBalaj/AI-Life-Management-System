package com.ailife.management.wellbeing;

import com.ailife.management.common.CurrentUserService;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.common.PagedResponse;
import com.ailife.management.common.RequestReader;
import com.ailife.management.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WellbeingService {
    private final CurrentUserService currentUserService;
    private final MoodLogRepository moodLogRepository;
    private final StressLogRepository stressLogRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> moodLogs(Integer minScore, Integer maxScore) {
        User user = currentUserService.requireUser();
        return moodLogRepository.findByUserIdAndTenantIdAndLoggedAtBetween(
                        user.getId(), user.getTenant().getId(), LocalDateTime.of(1970, 1, 1, 0, 0), LocalDateTime.now().plusDays(1))
                .stream()
                .filter(log -> minScore == null || log.getMoodScore() >= minScore)
                .filter(log -> maxScore == null || log.getMoodScore() <= maxScore)
                .map(DtoMapper::moodLog)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> moodLogsPaged(int page, int size) {
        User user = currentUserService.requireUser();
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "loggedAt"));
        Page<MoodLog> logPage = moodLogRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId(), pageRequest);
        List<Map<String, Object>> content = logPage.getContent().stream()
                .map(DtoMapper::moodLog)
                .collect(Collectors.toList());
        return PagedResponse.of(content, page, size, logPage.getTotalElements());
    }

    @Transactional
    public Map<String, Object> createMoodLog(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        MoodLog log = new MoodLog();
        log.setTenant(user.getTenant());
        log.setUser(user);
        log.setLoggedAt(RequestReader.dateTime(body, "loggedAt") == null ? LocalDateTime.now() : RequestReader.dateTime(body, "loggedAt"));
        Integer score = RequestReader.integer(body, "moodScore");
        log.setMoodScore(score == null ? 5 : score);
        log.setMoodLabel(RequestReader.string(body, "moodLabel", "neutral"));
        log.setJournalText(RequestReader.string(body, "journalText", ""));
        return DtoMapper.moodLog(moodLogRepository.save(log));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> stressLogs() {
        User user = currentUserService.requireUser();
        return stressLogRepository.findByUserIdAndTenantIdAndLoggedAtBetween(
                        user.getId(), user.getTenant().getId(), LocalDateTime.of(1970, 1, 1, 0, 0), LocalDateTime.now().plusDays(1))
                .stream()
                .map(DtoMapper::stressLog)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> createStressLog(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        StressLog log = new StressLog();
        log.setTenant(user.getTenant());
        log.setUser(user);
        log.setLoggedAt(RequestReader.dateTime(body, "loggedAt") == null ? LocalDateTime.now() : RequestReader.dateTime(body, "loggedAt"));
        Integer level = RequestReader.integer(body, "stressLevel");
        log.setStressLevel(level == null ? 3 : level);
        log.setTrigger(RequestReader.string(body, "trigger", ""));
        log.setCopingAction(RequestReader.string(body, "copingAction", ""));
        return DtoMapper.stressLog(stressLogRepository.save(log));
    }
}
