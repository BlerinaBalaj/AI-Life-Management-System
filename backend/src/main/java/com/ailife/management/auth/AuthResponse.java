package com.ailife.management.auth;

import lombok.AllArgsConstructor;
import lombok.Getter;

@Getter
@AllArgsConstructor
public class AuthResponse {
    private final String accessToken;
    private final String tokenType;
    private final Long userId;
    private final Long tenantId;
    private final String email;
    private final String fullName;
    private final String role;
}
