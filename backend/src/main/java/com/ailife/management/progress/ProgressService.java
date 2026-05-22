package com.ailife.management.progress;

import com.ailife.management.common.CurrentUserService;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.common.RequestReader;
import com.ailife.management.goal.Goal;
import com.ailife.management.goal.GoalRepository;
import com.ailife.management.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProgressService {
    private final CurrentUserService currentUserService;
    private final ProgressTrackerRepository progressTrackerRepository;
    private final GoalRepository goalRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(LocalDate from, LocalDate to) {
        User user = currentUserService.requireUser();
        LocalDate start = from == null ? LocalDate.now().minusDays(30) : from;
        LocalDate end = to == null ? LocalDate.now() : to;
        return progressTrackerRepository.findByUserIdAndTenantIdAndTrackedDateBetween(user.getId(), user.getTenant().getId(), start, end)
                .stream()
                .map(DtoMapper::progress)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        ProgressTracker tracker = new ProgressTracker();
        tracker.setTenant(user.getTenant());
        tracker.setUser(user);
        Long goalId = RequestReader.longValue(body, "goalId");
        if (goalId != null) {
            Goal goal = goalRepository.findByIdAndUserIdAndTenantId(goalId, user.getId(), user.getTenant().getId()).orElse(null);
            tracker.setGoal(goal);
        }
        tracker.setTrackedDate(RequestReader.date(body, "trackedDate") == null ? LocalDate.now() : RequestReader.date(body, "trackedDate"));
        tracker.setMetricName(RequestReader.string(body, "metricName", "progress"));
        Double value = RequestReader.decimal(body, "metricValue");
        tracker.setMetricValue(value == null ? 0 : value);
        tracker.setUnit(RequestReader.string(body, "unit", ""));
        tracker.setNotes(RequestReader.string(body, "notes", ""));
        return DtoMapper.progress(progressTrackerRepository.save(tracker));
    }
}
