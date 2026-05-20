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
        Role userRole = roleRepository.findByName(RoleName.USER)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.USER)));
        Role adminRole = roleRepository.findByName(RoleName.ADMIN)
                .orElseGet(() -> roleRepository.save(new Role(RoleName.ADMIN)));

        Tenant tenant = tenantRepository.findBySlug("system")
                .orElseGet(() -> tenantRepository.save(new Tenant("System", "system")));

        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setTenant(tenant);
            admin.setEmail(adminEmail);
            admin.setFullName("System Administrator");
            admin.setPasswordHash(passwordEncoder.encode(adminPassword));
            admin.setRole(adminRole);
            admin.setEnabled(true);
            userRepository.save(admin);
        }
    }
}
