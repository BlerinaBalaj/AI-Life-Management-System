package com.ailife.management.user;

import com.ailife.management.common.CurrentUserService;
import com.ailife.management.common.DtoMapper;
import com.ailife.management.common.RequestReader;
import com.ailife.management.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class UserService {
    private final CurrentUserService currentUserService;
    private final UserRepository userRepository;
    private final UserProfileRepository profileRepository;
    private final PreferenceRepository preferenceRepository;
    private final RoleRepository roleRepository;

    @Transactional(readOnly = true)
    public Map<String, Object> me() {
        User user = currentUserService.requireUser();
        Map<String, Object> dto = DtoMapper.user(user);
        profileRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId())
                .ifPresent(profile -> dto.put("profile", DtoMapper.profile(profile)));
        return dto;
    }

    @Transactional
    public Map<String, Object> updateMe(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        String fullName = RequestReader.string(body, "fullName");
        if (fullName != null) {
            user.setFullName(fullName);
        }

        UserProfile profile = profileRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId())
                .orElseGet(() -> {
                    UserProfile newProfile = new UserProfile();
                    newProfile.setUser(user);
                    newProfile.setTenant(user.getTenant());
                    return newProfile;
                });
        profile.setActivityLevel(RequestReader.string(body, "activityLevel", profile.getActivityLevel()));
        profile.setPrimaryFocus(RequestReader.string(body, "primaryFocus", profile.getPrimaryFocus()));
        Integer height = RequestReader.integer(body, "heightCm");
        Integer weight = RequestReader.integer(body, "weightKg");
        LocalDate birthDate = RequestReader.date(body, "birthDate");
        if (height != null) {
            profile.setHeightCm(height);
        }
        if (weight != null) {
            profile.setWeightKg(weight);
        }
        if (birthDate != null) {
            profile.setBirthDate(birthDate);
        }
        profileRepository.save(profile);
        return me();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> preferences() {
        User user = currentUserService.requireUser();
        return preferenceRepository.findByUserIdAndTenantId(user.getId(), user.getTenant().getId())
                .stream()
                .map(DtoMapper::preference)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> upsertPreference(Map<String, Object> body) {
        User user = currentUserService.requireUser();
        String key = RequestReader.string(body, "key", "general");
        Preference preference = new Preference();
        preference.setTenant(user.getTenant());
        preference.setUser(user);
        preference.setPreferenceKey(key);
        preference.setPreferenceValue(RequestReader.string(body, "value", ""));
        return DtoMapper.preference(preferenceRepository.save(preference));
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> adminUsers() {
        boolean isSuperAdmin = currentUserService.hasRole("SUPER_ADMIN");
        Long tenantId = currentUserService.tenantId();
        List<User> users = isSuperAdmin ? userRepository.findAll() : userRepository.findByTenantId(tenantId);
        return users.stream()
                .map(DtoMapper::user)
                .collect(Collectors.toList());
    }

    @Transactional
    public Map<String, Object> changeRole(Long userId, String roleName) {
        boolean isSuperAdmin = currentUserService.hasRole("SUPER_ADMIN");
        Long tenantId = currentUserService.tenantId();
        User user = userRepository.findById(userId)
                .filter(candidate -> isSuperAdmin || candidate.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        RoleName targetRole = RoleName.valueOf(roleName.toUpperCase().replace("ROLE_", ""));
        Role role = roleRepository.findByName(targetRole)
                .orElseGet(() -> roleRepository.save(new Role(targetRole)));
        user.setRole(role);
        return DtoMapper.user(userRepository.save(user));
    }

    @Transactional
    public void disableUser(Long userId) {
        boolean isSuperAdmin = currentUserService.hasRole("SUPER_ADMIN");
        Long tenantId = currentUserService.tenantId();
        User user = userRepository.findById(userId)
                .filter(candidate -> isSuperAdmin || candidate.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        // Toggle enabled state
        user.setEnabled(!user.isEnabled());
        userRepository.save(user);
    }
    
    @Transactional
    public void deleteUser(Long userId) {
        boolean isSuperAdmin = currentUserService.hasRole("SUPER_ADMIN");
        Long tenantId = currentUserService.tenantId();
        User user = userRepository.findById(userId)
                .filter(candidate -> isSuperAdmin || candidate.getTenant().getId().equals(tenantId))
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        userRepository.delete(user);
    }
}
