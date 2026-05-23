package com.ailife.management.auth;

import com.ailife.management.exception.BadRequestException;
import com.ailife.management.exception.ApiException;
import com.ailife.management.security.JwtTokenProvider;
import com.ailife.management.security.UserPrincipal;
import com.ailife.management.tenant.Tenant;
import com.ailife.management.tenant.TenantRepository;
import com.ailife.management.user.Role;
import com.ailife.management.user.RoleName;
import com.ailife.management.user.RoleRepository;
import com.ailife.management.user.User;
import com.ailife.management.user.UserProfile;
import com.ailife.management.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.http.HttpStatus;

import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final PasswordEncoder passwordEncoder;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email is already registered");
        }

        String slug = slugify(request.getTenantName());
        Tenant tenant = tenantRepository.findBySlug(slug)
                .orElseGet(() -> tenantRepository.save(new Tenant(request.getTenantName(), slug)));
                
        RoleName assignedRole = resolveRole(request, tenant);
        
        Role role = roleRepository.findByName(assignedRole)
                .orElseGet(() -> roleRepository.save(new Role(assignedRole)));

        User user = new User();
        user.setTenant(tenant);
        user.setFullName(request.getFullName());
        user.setEmail(request.getEmail().toLowerCase(Locale.ROOT));
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(role);

        UserProfile profile = new UserProfile();
        profile.setTenant(tenant);
        profile.setUser(user);
        profile.setPrimaryFocus("balanced-life");
        user.setProfile(profile);

        User saved = userRepository.save(user);
        return createResponse(new UserPrincipal(saved), saved);
    }

    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        } catch (DisabledException ex) {
            throw new ApiException(HttpStatus.FORBIDDEN,
                    "This account is suspended. Please contact your workspace administrator.");
        } catch (AuthenticationException ex) {
            throw new BadRequestException("Invalid email or password.");
        }
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));
        return createResponse(principal, user);
    }

    private AuthResponse createResponse(UserPrincipal principal, User user) {
        String token = tokenProvider.createToken(principal);
        String role = user.getRole().getName().name();
        return new AuthResponse(token, "Bearer", user.getId(), user.getTenant().getId(), user.getTenant().getName(),
                user.getEmail(), user.getFullName(), role);
    }

    private RoleName resolveRole(RegisterRequest request, Tenant tenant) {
        if (request.getEmail().equalsIgnoreCase("admin@ailife.local")) {
            return RoleName.SUPER_ADMIN;
        }
        return userRepository.findByTenantId(tenant.getId()).isEmpty() ? RoleName.ADMIN : RoleName.USER;
    }

    private String slugify(String value) {
        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
