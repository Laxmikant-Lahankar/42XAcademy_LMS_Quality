package com.academy42x.lms.dto.student;

import com.academy42x.lms.dto.AnnouncementDto;
import com.academy42x.lms.dto.CertificateDto;
import com.academy42x.lms.dto.CourseDto;
import com.academy42x.lms.dto.CourseSummaryDto;
import com.academy42x.lms.dto.LectureDto;
import com.academy42x.lms.dto.ModuleDto;
import com.academy42x.lms.dto.ResourceDto;
import com.academy42x.lms.dto.StudentDto;
import com.academy42x.lms.dto.StudentLectureDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import java.time.LocalDateTime;
import java.util.List;

/** Response and request bodies for the Student panel API (/api/students/{id}/…). */
public final class StudentDtos {

    private StudentDtos() {
    }

    // ---------- Dashboard ----------

    public record Dashboard(List<CourseSummaryDto> courses, ContinueLearning continueLearning,
                            List<Activity> recentActivity, List<AnnouncementDto> announcements, Stats stats) {
    }

    public record Stats(int enrolledCourses, int lecturesCompleted, int overallPercent, int coursesCompleted) {
    }

    public record ContinueLearning(LectureDto lecture, ModuleDto module, CourseDto course, LocalDateTime watchedAt) {
    }

    public record Activity(String id, String text, LocalDateTime at) {
    }

    // ---------- My courses ----------

    /** Enrolled courses plus a small lecture index so students can search lectures too. */
    public record MyCourses(List<CourseSummaryDto> courses, List<LectureIndexItem> lectureIndex) {
    }

    public record LectureIndexItem(String id, String title, String courseId, String courseTitle, String moduleTitle) {
    }

    // ---------- Course details ----------

    public record CourseDetails(CourseSummaryDto course, List<ModuleWithLectures> modules,
                                List<ResourceDto> resources, ResourceDto syllabus) {
    }

    public record ModuleWithLectures(@JsonUnwrapped ModuleDto module, List<StudentLectureDto> lectures) {
    }

    // ---------- Lecture player ----------

    public record LectureView(CourseDto course, ModuleDto module, StudentLectureDto lecture, LectureDto previous,
                              LectureDto next, List<StudentLectureDto> moduleLectures, List<ResourceDto> resources,
                              Position position) {
    }

    public record Position(int current, int total) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CompletionRequest(Boolean completed) {
    }

    public record Completion(String lectureId, boolean completed) {
    }

    // ---------- Progress ----------

    public record Progress(List<CourseProgress> courses, LastWatchedItem lastWatched) {
    }

    public record CourseProgress(@JsonUnwrapped CourseSummaryDto summary, List<ModuleProgress> modules,
                                 CertificateDto certificate) {
    }

    public record ModuleProgress(String id, String title, int completed, int total) {
    }

    public record LastWatchedItem(LectureDto lecture, CourseDto course, LocalDateTime watchedAt) {
    }

    // ---------- Profile ----------

    public record Profile(StudentDto student, List<CourseSummaryDto> courses) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ProfileUpdateRequest(String phone, String city) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ChangePasswordRequest(String currentPassword, String newPassword) {
    }

    public record ChangePasswordResponse(boolean changed) {
    }
}
