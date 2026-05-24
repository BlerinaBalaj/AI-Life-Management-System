package com.ailife.management.security;

import com.ailife.management.tenant.TenantContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.hibernate.Session;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;

import javax.persistence.EntityManager;
import javax.servlet.FilterChain;
import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

@Component
@Slf4j
@RequiredArgsConstructor
public class JwtAuthenticationFilter extends OncePerRequestFilter {
    private final JwtTokenProvider tokenProvider;
    private final CustomUserDetailsService userDetailsService;
    private final EntityManager entityManager;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String token = resolveToken(request);
            if (StringUtils.hasText(token)) {
                try {
                    if (tokenProvider.validate(token)) {
                        Long userId = tokenProvider.getUserId(token);
                        Long tenantId = tokenProvider.getTenantId(token);
                        UserPrincipal principal = (UserPrincipal) userDetailsService.loadUserById(userId);
                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(principal, null, principal.getAuthorities());
                        authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                        SecurityContextHolder.getContext().setAuthentication(authentication);
                        TenantContext.setTenantId(tenantId);
                        enableTenantFilter(tenantId);
                    }
                } catch (Exception ex) {
                    log.warn("Invalid JWT rejected: {}", ex.getMessage());
                    SecurityContextHolder.clearContext();
                }
            }
            filterChain.doFilter(request, response);
        } finally {
            disableTenantFilter();
            TenantContext.clear();
        }
    }

    private void enableTenantFilter(Long tenantId) {
        try {
            entityManager.unwrap(Session.class)
                    .enableFilter("tenantFilter")
                    .setParameter("tenantId", tenantId);
        } catch (RuntimeException ex) {
            log.debug("Tenant Hibernate filter was not enabled for this request: {}", ex.getMessage());
        }
    }

    private void disableTenantFilter() {
        try {
            entityManager.unwrap(Session.class).disableFilter("tenantFilter");
        } catch (RuntimeException ex) {
            log.debug("Tenant Hibernate filter was not disabled for this request: {}", ex.getMessage());
        }
    }

    private String resolveToken(HttpServletRequest request) {
        String bearer = request.getHeader("Authorization");
        if (StringUtils.hasText(bearer) && bearer.startsWith("Bearer ")) {
            return bearer.substring(7);
        }
        return null;
    }
}
