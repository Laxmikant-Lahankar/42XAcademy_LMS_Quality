package com.academy42x.lms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** One line in a student's "Recent activity" list. */
@Entity
@Table(name = "student_activity")
public class StudentActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String studentId;

    @Column(nullable = false)
    private String text;

    @Column(nullable = false)
    private LocalDateTime createdAt;

    public StudentActivity() {
    }

    public StudentActivity(String studentId, String text, LocalDateTime createdAt) {
        this.studentId = studentId;
        this.text = text;
        this.createdAt = createdAt;
    }

    public Long getId() { return id; }
    public String getStudentId() { return studentId; }
    public String getText() { return text; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
