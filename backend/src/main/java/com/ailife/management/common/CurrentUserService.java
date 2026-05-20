package com.ailife.management.common;

import com.ailife.management.security.UserPrincipal;
import com.ailife.management.tenant.Tenant;
import com.ailife.management.tenant.TenantRepository;
import com.ailife.management.user.User;
import com.ailife.management.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class CurrentUserService {
    private final UserRepository userRepository;
    private final TenantRepository tenantRepository;

    public User requireUser() {
        Long userId = requirePrincipal().getId();
        return userRepository.findById(userId)
                .orElseThrow(() -> new IllegalStateException("Authenticated user no longer exists"));
    }

    public Tenant requireTenant() {
        Long tenantId = requirePrincipal().getTenantId();
        return tenantRepository.findById(tenantId)
                .orElseThrow(() -> new IllegalStateException("Authenticated tenant no longer exists"));
    }

    public Long tenantId() {
        return requirePrincipal().getTenantId();
    }

    public Long userId() {
        return requirePrincipal().getId();
    }

    private UserPrincipal requirePrincipal() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !(authentication.getPrincipal() instanceof UserPrincipal)) {
            throw new IllegalStateException("No authenticated user in context");
        }
        return (UserPrincipal) authentication.getPrincipal();
    }
}
