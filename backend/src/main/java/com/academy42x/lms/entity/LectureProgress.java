package com.academy42x.lms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.IdClass;
import jakarta.persistence.Table;
import java.io.Serializable;
import java.time.LocalDateTime;
import java.util.Objects;

/** A lecture the student has marked as complete. */
@Entity
@Table(name = "lecture_progress")
@IdClass(LectureProgress.Key.class)
public class LectureProgress {

    @Id
    private String studentId;

    @Id
    private String lectureId;

    @Column(nullable = false)
    private LocalDateTime completedAt;

    public LectureProgress() {
    }

    public LectureProgress(String studentId, String lectureId, LocalDateTime completedAt) {
        this.studentId = studentId;
        this.lectureId = lectureId;
        this.completedAt = completedAt;
    }

    public String getStudentId() { return studentId; }
    public String getLectureId() { return lectureId; }
    public LocalDateTime getCompletedAt() { return completedAt; }

    /** Composite primary key (student_id, lecture_id). */
    public static class Key implements Serializable {
        private String studentId;
        private String lectureId;

        public Key() {
        }

        public Key(String studentId, String lectureId) {
            this.studentId = studentId;
            this.lectureId = lectureId;
        }

        @Override
        public boolean equals(Object other) {
            return other instanceof Key key
                    && Objects.equals(studentId, key.studentId)
                    && Objects.equals(lectureId, key.lectureId);
        }

        @Override
        public int hashCode() {
            return Objects.hash(studentId, lectureId);
        }
    }
}
