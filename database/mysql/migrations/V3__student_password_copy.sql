-- Encrypted copy of a student's password so admins can see it in Students → View.
-- Login still uses the BCrypt hash (password_hash). This column holds AES-256-GCM
-- ciphertext; the key is NOT in the database (app.password-vault.key in the backend config).
ALTER TABLE users ADD COLUMN password_encrypted VARCHAR(512) NULL AFTER password_hash;
