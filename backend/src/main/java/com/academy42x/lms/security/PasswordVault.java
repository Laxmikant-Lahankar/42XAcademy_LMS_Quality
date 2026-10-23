package com.academy42x.lms.security;

import com.academy42x.lms.config.AppProperties;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.MessageDigest;
import java.security.SecureRandom;
import java.util.Base64;
import javax.crypto.Cipher;
import javax.crypto.SecretKey;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

/**
 * Keeps an encrypted copy of student passwords so admins can see them in Students → View.
 *
 * - Login never uses this; it uses the BCrypt hash.
 * - AES-256-GCM. The key comes from app.password-vault.key (env PASSWORD_VAULT_KEY),
 *   never from the database, so a database dump alone does not reveal passwords.
 * - If no key is configured the feature is off: nothing is stored and nothing can be shown.
 */
@Component
public class PasswordVault {

    private static final Logger log = LoggerFactory.getLogger(PasswordVault.class);
    private static final String ALGORITHM = "AES/GCM/NoPadding";
    private static final int IV_BYTES = 12;
    private static final int TAG_BITS = 128;

    private final SecretKey key;
    private final SecureRandom random = new SecureRandom();

    public PasswordVault(AppProperties properties) {
        String configured = properties.passwordVault() == null ? null : properties.passwordVault().key();
        this.key = configured == null || configured.isBlank() ? null : deriveKey(configured);
        if (key == null) {
            log.warn("app.password-vault.key is not set: admins will not be able to see student passwords.");
        }
    }

    public boolean isEnabled() {
        return key != null;
    }

    /** Returns Base64(iv + ciphertext), or null when the vault is off. */
    public String encrypt(String password) {
        if (key == null || password == null) {
            return null;
        }
        try {
            byte[] iv = new byte[IV_BYTES];
            random.nextBytes(iv);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.ENCRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, iv));
            byte[] encrypted = cipher.doFinal(password.getBytes(StandardCharsets.UTF_8));
            return Base64.getEncoder().encodeToString(ByteBuffer.allocate(iv.length + encrypted.length)
                    .put(iv).put(encrypted).array());
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Could not encrypt the password copy.", exception);
        }
    }

    /** Returns the password, or null if it is missing, the vault is off, or the key changed. */
    public String decrypt(String stored) {
        if (key == null || stored == null || stored.isBlank()) {
            return null;
        }
        try {
            byte[] data = Base64.getDecoder().decode(stored);
            Cipher cipher = Cipher.getInstance(ALGORITHM);
            cipher.init(Cipher.DECRYPT_MODE, key, new GCMParameterSpec(TAG_BITS, data, 0, IV_BYTES));
            return new String(cipher.doFinal(data, IV_BYTES, data.length - IV_BYTES), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException exception) {
            log.warn("A stored password copy could not be decrypted (was the vault key changed?).");
            return null;
        }
    }

    /** Any configured text becomes a 256-bit key. */
    private static SecretKey deriveKey(String secret) {
        try {
            byte[] hash = MessageDigest.getInstance("SHA-256").digest(secret.getBytes(StandardCharsets.UTF_8));
            return new SecretKeySpec(hash, "AES");
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException(exception);
        }
    }
}
