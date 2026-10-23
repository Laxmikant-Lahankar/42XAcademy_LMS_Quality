package com.academy42x.lms.controller;

import com.academy42x.lms.dto.auth.AuthDtos;
import com.academy42x.lms.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/auth — login, logout and password reset request. */
@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/login")
    public AuthDtos.LoginResponse login(@Valid @RequestBody AuthDtos.LoginRequest request) {
        return authService.login(request);
    }

    /** Tokens are stateless: the frontend forgets the token. Kept so the API matches the frontend. */
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/forgot-password")
    public AuthDtos.ForgotPasswordResponse forgotPassword(@Valid @RequestBody AuthDtos.ForgotPasswordRequest request) {
        return authService.requestPasswordReset(request);
    }

    /** The signed-in user's own profile. */
    @GetMapping("/me")
    public AuthDtos.MyProfile me(@AuthenticationPrincipal Jwt jwt) {
        return authService.me(jwt.getSubject());
    }

    /** The signed-in user updates their own name, email, phone and city (returns a fresh token). */
    @PutMapping("/me")
    public AuthDtos.UpdateProfileResponse updateMe(@AuthenticationPrincipal Jwt jwt,
                                                   @RequestBody AuthDtos.UpdateProfileRequest request) {
        return authService.updateMe(jwt.getSubject(), request);
    }

    /** Logged-in users (admin or student) change their own password. Needs a valid token. */
    @PostMapping("/change-password")
    public AuthDtos.ChangePasswordResponse changePassword(@AuthenticationPrincipal Jwt jwt,
                                                          @RequestBody AuthDtos.ChangePasswordRequest request) {
        return authService.changePassword(jwt.getSubject(), request);
    }
}
