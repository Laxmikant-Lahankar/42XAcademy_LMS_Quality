package com.academy42x.lms.dto.auth;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

/** Request and response bodies for /api/auth. */
public final class AuthDtos {

    private AuthDtos() {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LoginRequest(
            @NotBlank(message = "Enter your email and password.") String email,
            @NotBlank(message = "Enter your email and password.") String password,
            String role) {
    }

    /** { user: { id, name, email, role }, token } — the frontend stores this as the session. */
    public record LoginResponse(UserInfo user, String token) {
    }

    public record UserInfo(String id, String name, String email, String role) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ForgotPasswordRequest(@NotBlank(message = "Enter the email you use to sign in.") String email) {
    }

    public record ForgotPasswordResponse(String email) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ChangePasswordRequest(String currentPassword, String newPassword) {
    }

    public record ChangePasswordResponse(boolean changed) {
    }

    /** The signed-in user's own profile (GET /auth/me). */
    public record MyProfile(String id, String name, String email, String role, String phone, String city,
                            LocalDateTime createdAt) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record UpdateProfileRequest(String name, String email, String phone, String city) {
    }

    /** Updated profile plus a fresh session (new token carries the new name / email). */
    public record UpdateProfileResponse(MyProfile profile, UserInfo user, String token) {
    }
}
