package com.ailife.management.auth;

import lombok.Getter;
import lombok.Setter;

import javax.validation.constraints.Email;
import javax.validation.constraints.NotBlank;
import javax.validation.constraints.Size;

@Getter
@Setter
public class RegisterRequest {
    @NotBlank
    @Size(max = 120)
    private String fullName;

    @Email
    @NotBlank
    @Size(max = 160)
    private String email;

    @NotBlank
    @Size(min = 8, max = 120)
    private String password;

    @NotBlank
    @Size(max = 120)
    private String tenantName;
}
