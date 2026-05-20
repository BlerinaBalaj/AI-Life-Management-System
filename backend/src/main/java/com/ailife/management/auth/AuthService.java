package com.ailife.management.auth;

import com.ailife.management.exception.BadRequestException;
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
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        Role role = roleRepository.findByName(RoleName.USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.USER)));

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
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword()));
        UserPrincipal principal = (UserPrincipal) authentication.getPrincipal();
        User user = userRepository.findById(principal.getId())
                .orElseThrow(() -> new BadRequestException("Invalid credentials"));
        return createResponse(principal, user);
    }

    private AuthResponse createResponse(UserPrincipal principal, User user) {
        String token = tokenProvider.createToken(principal);
        String role = user.getRole().getName().name();
        return new AuthResponse(token, "Bearer", user.getId(), user.getTenant().getId(),
                user.getEmail(), user.getFullName(), role);
    }

    private String slugify(String value) {
        return value.toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");
    }
}
