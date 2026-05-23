package com.ailife.management.config;

import com.ailife.management.tenant.Tenant;
import com.ailife.management.tenant.TenantRepository;
import com.ailife.management.user.Role;
import com.ailife.management.user.RoleName;
import com.ailife.management.user.RoleRepository;
import com.ailife.management.user.User;
import com.ailife.management.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {
    private final RoleRepository roleRepository;
    private final TenantRepository tenantRepository;
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Value("${app.admin.email}")
    private String adminEmail;

    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    @Transactional
    public void run(String... args) {
        roleRepository.findByName(RoleName.USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.USER)));
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ADMIN)));
        Role superAdminRole = roleRepository.findByName(RoleName.SUPER_ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.SUPER_ADMIN)));

        Tenant tenant = tenantRepository.findBySlug("system")
                .orElseGet(() -> tenantRepository.save(new Tenant("System", "system")));

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setTenant(tenant);
            admin.setEmail(adminEmail);
            admin.setFullName("System Administrator");
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole(superAdminRole);
            admin.setEnabled(true);
            userRepository.save(admin);
        } else {
            userRepository.findByEmail(adminEmail).ifPresent(admin -> {
                admin.setRole(superAdminRole);
                admin.setEnabled(true);
                userRepository.save(admin);
            });
        }

        tenantRepository.findAll().stream()
                .filter(existingTenant -> !"system".equalsIgnoreCase(existingTenant.getSlug()))
                .forEach(existingTenant -> ensureTenantAdmin(existingTenant, adminRole));
    }

    private void ensureTenantAdmin(Tenant tenant, Role adminRole) {
        List<User> users = userRepository.findByTenantId(tenant.getId());
        boolean hasAdmin = users.stream()
                .anyMatch(user -> user.getRole() != null && user.getRole().getName() == RoleName.ADMIN);
        if (hasAdmin || users.isEmpty()) {
            return;
        }

        users.stream()
                .min(Comparator.comparing(User::getId))
                .ifPresent(firstUser -> {
                    firstUser.setRole(adminRole);
                    userRepository.save(firstUser);
                });
    }
}
