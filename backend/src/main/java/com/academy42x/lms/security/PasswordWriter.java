package com.academy42x.lms.security;

import com.academy42x.lms.entity.User;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * The one place that sets a user's password:
 * - always stores the BCrypt hash (used for login);
 * - for students, also stores the encrypted copy admins can view (Students → View).
 */
@Component
public class PasswordWriter {

    private final PasswordEncoder passwordEncoder;
    private final PasswordVault vault;

    public PasswordWriter(PasswordEncoder passwordEncoder, PasswordVault vault) {
        this.passwordEncoder = passwordEncoder;
        this.vault = vault;
    }

    public void setPassword(User user, String password) {
        user.setPasswordHash(passwordEncoder.encode(password));
        user.setPasswordEncrypted(User.ROLE_STUDENT.equals(user.getRole()) ? vault.encrypt(password) : null);
    }

    /** The student's current password for admins, or null when no copy is available. */
    public String readableCopy(User user) {
        return vault.decrypt(user.getPasswordEncrypted());
    }
}
