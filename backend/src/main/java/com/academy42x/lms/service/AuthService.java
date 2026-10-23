package com.academy42x.lms.service;

import com.academy42x.lms.dto.auth.AuthDtos;
import com.academy42x.lms.entity.User;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.repository.UserRepository;
import com.academy42x.lms.security.JwtService;
import com.academy42x.lms.security.PasswordWriter;
import com.academy42x.lms.util.Inputs;
import java.util.Locale;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Login with email + password for the selected role; returns a JWT. */
@Service
@Transactional(readOnly = true)
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);
    private static final String INVALID_LOGIN = "Incorrect email or password for the selected role.";
    private static final int MIN_PASSWORD_LENGTH = 8;

    private final UserRepository users;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final PasswordWriter passwords;

    public AuthService(UserRepository users, PasswordEncoder passwordEncoder, JwtService jwtService,
                       PasswordWriter passwords) {
        this.users = users;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.passwords = passwords;
    }

    public AuthDtos.LoginResponse login(AuthDtos.LoginRequest request) {
        String role = request.role() == null || request.role().isBlank() ? User.ROLE_STUDENT : request.role().trim();

        User user = users.findByEmailIgnoreCase(request.email().trim())
                .filter(u -> u.getRole().equals(role))
                .filter(u -> u.getPasswordHash() != null && passwordEncoder.matches(request.password(), u.getPasswordHash()))
                .orElseThrow(() -> ApiException.unauthorized(INVALID_LOGIN));

        if (!user.isActive()) {
            throw ApiException.forbidden("This account is deactivated. Please contact 42X Academy support.");
        }

        AuthDtos.UserInfo info = new AuthDtos.UserInfo(user.getId(), user.getName(), user.getEmail(), user.getRole());
        return new AuthDtos.LoginResponse(info, jwtService.createToken(user));
    }

    public AuthDtos.MyProfile me(String userId) {
        return toProfile(requireUser(userId));
    }

    /**
     * The signed-in user updates their own name, email (= login username), phone and city.
     * Returns a new token so the header and future actions use the new name / email.
     */
    @Transactional
    public AuthDtos.UpdateProfileResponse updateMe(String userId, AuthDtos.UpdateProfileRequest request) {
        User user = requireUser(userId);

        String name = Inputs.requireText(request.name(), "Full name");
        String email = Inputs.requireText(request.email(), "Email").toLowerCase(Locale.ROOT);
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw ApiException.badRequest("Enter a valid email address.");
        }
        users.findByEmailIgnoreCase(email)
                .filter(other -> !other.getId().equals(user.getId()))
                .ifPresent(other -> {
                    throw ApiException.conflict("Another account already uses this email.");
                });

        user.setName(name);
        user.setEmail(email);
        user.setPhone(Inputs.text(request.phone()));
        user.setCity(Inputs.text(request.city()));
        User saved = users.save(user);

        AuthDtos.UserInfo info = new AuthDtos.UserInfo(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole());
        return new AuthDtos.UpdateProfileResponse(toProfile(saved), info, jwtService.createToken(saved));
    }

    private User requireUser(String userId) {
        return users.findById(userId).orElseThrow(() -> ApiException.unauthorized("Please sign in again."));
    }

    private static AuthDtos.MyProfile toProfile(User user) {
        return new AuthDtos.MyProfile(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getPhone(),
                user.getCity(), user.getCreatedAt());
    }

    /** Change the logged-in user's own password (admins and students). */
    @Transactional
    public AuthDtos.ChangePasswordResponse changePassword(String userId, AuthDtos.ChangePasswordRequest request) {
        User user = users.findById(userId).orElseThrow(() -> ApiException.unauthorized("Please sign in again."));
        String current = request.currentPassword() == null ? "" : request.currentPassword();
        String next = request.newPassword() == null ? "" : request.newPassword();

        if (user.getPasswordHash() == null || !passwordEncoder.matches(current, user.getPasswordHash())) {
            throw ApiException.badRequest("Your current password is not correct.");
        }
        if (next.length() < MIN_PASSWORD_LENGTH) {
            throw ApiException.badRequest("The new password must be at least " + MIN_PASSWORD_LENGTH + " characters.");
        }
        if (passwordEncoder.matches(next, user.getPasswordHash())) {
            throw ApiException.badRequest("The new password must be different from the current one.");
        }

        passwords.setPassword(user, next);
        users.save(user);
        log.info("Password changed for user {}.", user.getId());
        return new AuthDtos.ChangePasswordResponse(true);
    }

    /**
     * Password reset request. Always answers the same way so nobody can find out which emails exist.
     * TODO: send a reset link by email once an email service (e.g. Azure Communication Services) is chosen.
     */
    public AuthDtos.ForgotPasswordResponse requestPasswordReset(AuthDtos.ForgotPasswordRequest request) {
        String email = request.email().trim();
        if (users.findByEmailIgnoreCase(email).isPresent()) {
            log.info("Password reset requested for an existing account.");
        }
        return new AuthDtos.ForgotPasswordResponse(email);
    }
}
