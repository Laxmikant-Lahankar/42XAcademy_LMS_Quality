package com.academy42x.lms.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Application settings from application.properties (prefix "app").
 * Secrets come from environment variables or the git-ignored application-local.properties.
 */
@ConfigurationProperties(prefix = "app")
public record AppProperties(Jwt jwt, Cors cors, Seed seed, PasswordVault passwordVault) {

    /** secret: at least 32 characters. expirationMinutes: how long a login stays valid. */
    public record Jwt(String secret, long expirationMinutes, String issuer) {
    }

    /** Frontend origins allowed to call the API, e.g. http://localhost:5173, https://student.42xacademy.com */
    public record Cors(List<String> allowedOrigins) {
    }

    /** Demo passwords given to seeded users that have none (local development only; leave empty in production). */
    public record Seed(String studentPassword, String adminPassword) {
    }

    /** Key that encrypts the student password copies admins can view. Keep it secret and never change it casually. */
    public record PasswordVault(String key) {
    }
}
