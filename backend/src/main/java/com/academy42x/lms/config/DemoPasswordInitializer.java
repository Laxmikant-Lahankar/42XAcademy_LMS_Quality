package com.academy42x.lms.config;

import com.academy42x.lms.entity.User;
import com.academy42x.lms.repository.UserRepository;
import com.academy42x.lms.security.PasswordVault;
import com.academy42x.lms.security.PasswordWriter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/**
 * Demo data helper (local development).
 * 1. Seeded users have no password in the SQL file (no secrets in git). If app.seed.* passwords
 *    are configured, they are set here for users that still have none.
 * 2. Students who still use the demo password but have no admin-viewable copy get one,
 *    so Students → View can show it. In production leave app.seed.* empty.
 */
@Component
public class DemoPasswordInitializer implements ApplicationRunner {

    private static final Logger log = LoggerFactory.getLogger(DemoPasswordInitializer.class);

    private final UserRepository users;
    private final PasswordWriter passwords;
    private final PasswordEncoder passwordEncoder;
    private final PasswordVault vault;
    private final AppProperties properties;

    public DemoPasswordInitializer(UserRepository users, PasswordWriter passwords, PasswordEncoder passwordEncoder,
                                   PasswordVault vault, AppProperties properties) {
        this.users = users;
        this.passwords = passwords;
        this.passwordEncoder = passwordEncoder;
        this.vault = vault;
        this.properties = properties;
    }

    @Override
    @Transactional
    public void run(ApplicationArguments args) {
        AppProperties.Seed seed = properties.seed();
        if (seed == null) {
            return;
        }

        int set = 0;
        for (User user : users.findByPasswordHashIsNull()) {
            String password = User.ROLE_ADMIN.equals(user.getRole()) ? seed.adminPassword() : seed.studentPassword();
            if (password != null && !password.isBlank()) {
                passwords.setPassword(user, password);
                set++;
            }
        }

        int copied = 0;
        String studentPassword = seed.studentPassword();
        if (vault.isEnabled() && studentPassword != null && !studentPassword.isBlank()) {
            for (User student : users.findByRoleOrderByNameAsc(User.ROLE_STUDENT)) {
                boolean missingCopy = student.getPasswordEncrypted() == null && student.getPasswordHash() != null;
                if (missingCopy && passwordEncoder.matches(studentPassword, student.getPasswordHash())) {
                    student.setPasswordEncrypted(vault.encrypt(studentPassword));
                    copied++;
                }
            }
        }

        if (set > 0 || copied > 0) {
            log.info("Demo passwords: set for {} user(s); admin-viewable copy added for {} student(s).", set, copied);
        }
    }
}
