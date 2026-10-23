package com.academy42x.lms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** A student or an admin. {@code role} decides which panel the user can open. */
@Entity
@Table(name = "users")
public class User {

    public static final String ROLE_STUDENT = "STUDENT";
    public static final String ROLE_ADMIN = "ADMIN";
    public static final String STATUS_ACTIVE = "Active";
    public static final String STATUS_INACTIVE = "Inactive";

    @Id
    private String id;

    @Column(nullable = false)
    private String role;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    private String passwordHash;

    /** AES-encrypted copy of a student's password, shown to admins (see PasswordVault). Never used for login. */
    private String passwordEncrypted;

    @Column(nullable = false)
    private String phone = "";

    @Column(nullable = false)
    private String city = "";

    @Column(nullable = false)
    private String batch = "";

    @Column(nullable = false)
    private String status = STATUS_ACTIVE;

    @Column(nullable = false)
    private LocalDate joinedOn;

    /** Exact date and time the account was added (set by the database). */
    @Column(insertable = false, updatable = false)
    private LocalDateTime createdAt;

    public boolean isActive() {
        return STATUS_ACTIVE.equals(status);
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public String getPasswordEncrypted() { return passwordEncrypted; }
    public void setPasswordEncrypted(String passwordEncrypted) { this.passwordEncrypted = passwordEncrypted; }
    public String getPhone() { return phone; }
    public void setPhone(String phone) { this.phone = phone; }
    public String getCity() { return city; }
    public void setCity(String city) { this.city = city; }
    public String getBatch() { return batch; }
    public void setBatch(String batch) { this.batch = batch; }
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    public LocalDate getJoinedOn() { return joinedOn; }
    public void setJoinedOn(LocalDate joinedOn) { this.joinedOn = joinedOn; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
