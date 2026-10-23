package com.academy42x.lms.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/** The last lecture a student opened ("Continue learning"). One row per student. */
@Entity
@Table(name = "last_watched")
public class LastWatched {

    @Id
    private String studentId;

    @Column(nullable = false)
    private String lectureId;

    @Column(nullable = false)
    private LocalDateTime watchedAt;

    public LastWatched() {
    }

    public LastWatched(String studentId, String lectureId, LocalDateTime watchedAt) {
        this.studentId = studentId;
        this.lectureId = lectureId;
        this.watchedAt = watchedAt;
    }

    public String getStudentId() { return studentId; }
    public String getLectureId() { return lectureId; }
    public void setLectureId(String lectureId) { this.lectureId = lectureId; }
    public LocalDateTime getWatchedAt() { return watchedAt; }
    public void setWatchedAt(LocalDateTime watchedAt) { this.watchedAt = watchedAt; }
}
