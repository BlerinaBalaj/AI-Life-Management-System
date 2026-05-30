package com.ailife.management.goal;

import com.ailife.management.category.CategoryRepository;
import com.ailife.management.common.CurrentUserService;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.common.PagedResponse;
import com.ailife.management.common.RequestReader;
import com.ailife.management.exception.ResourceNotFoundException;
import com.ailife.management.user.User;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GoalService {
    private final CurrentUserService currentUserService;
    private final GoalRepository goalRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<Map<String, Object>> list(String status) {
        User user = currentUserService.requireUser();
        List<Goal> goals = status == null
                ? goalRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId())
                : goalRepository.findByUserIdAndTenantIdAndStatusIgnoreCase(user.getId(), user.getTenant().getId(), status);
        return goals.stream().map(DtoMapper::goal).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> listPaged(String status, int page, int size) {
        User user = currentUserService.requireUser();
        PageRequest pageRequest = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt"));
        Page<Goal> goalPage = goalRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId(), pageRequest);
        List<Map<String, Object>> content = goalPage.getContent().stream()
                .filter(g -> status == null || g.getStatus().equalsIgnoreCase(status))
                .map(DtoMapper::goal)
                .collect(Collectors.toList());
        return PagedResponse.of(content, page, size, goalPage.getTotalElements());
    }

    @Transactional
    public Map<String, Object> create(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        Goal goal = new Goal();
        goal.setTenant(user.getTenant());
        goal.setUser(user);
        apply(goal, body, user.getTenant().getId());
        return DtoMapper.goal(goalRepository.save(goal));
    }

    @Transactional
    public Map<String, Object> update(Long id, Map<String, Object> body) {
        User user = currentUserService.requireUser();
        Goal goal = goalRepository.findByIdAndUserIdAndTenantId(id, user.getId(), user.getTenant().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        apply(goal, body, user.getTenant().getId());
        return DtoMapper.goal(goalRepository.save(goal));
    }

    @Transactional
    public void delete(Long id) {
        User user = currentUserService.requireUser();
        Goal goal = goalRepository.findByIdAndUserIdAndTenantId(id, user.getId(), user.getTenant().getId())
                .orElseThrow(() -> new ResourceNotFoundException("Goal not found"));
        goalRepository.delete(goal);
    }

    private void apply(Goal goal, Map<String, Object> body, Long tenantId) {
        goal.setTitle(RequestReader.string(body, "title", goal.getTitle()));
        goal.setDescription(RequestReader.string(body, "description", goal.getDescription()));
        goal.setStatus(RequestReader.string(body, "status", goal.getStatus()));
        Integer priority = RequestReader.integer(body, "priority");
        if (priority != null) {
            goal.setPriority(priority);
        }
        if (RequestReader.date(body, "targetDate") != null) {
            goal.setTargetDate(RequestReader.date(body, "targetDate"));
        }
        Long categoryId = RequestReader.longValue(body, "categoryId");
        if (categoryId != null) {
            categoryRepository.findById(categoryId)
                    .filter(category -> category.getTenant().getId().equals(tenantId))
                    .ifPresent(goal::setCategory);
        }
    }
}
