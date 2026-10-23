package com.academy42x.lms.dto.admin;

import com.academy42x.lms.dto.CertificateDto;
import com.academy42x.lms.dto.CourseDto;
import com.academy42x.lms.dto.EnrollmentRowDto;
import com.academy42x.lms.dto.ModuleDto;
import com.academy42x.lms.dto.ProgressDto;
import com.academy42x.lms.dto.StudentDto;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonUnwrapped;
import java.time.LocalDate;
import java.util.List;

/**
 * Response and request bodies for the Admin portal API (/api/admin/…).
 * Request records ignore unknown fields (the frontend sends whole table rows when editing),
 * and numbers are typed Object because HTML forms send them as strings.
 */
public final class AdminDtos {

    private AdminDtos() {
    }

    // ---------- Responses ----------

    public record Dashboard(Stats stats, List<Activity> recentActivity) {
    }

    public record Stats(long totalStudents, long activeStudents, long totalCourses, long publishedCourses,
                        long totalEnrollments) {
    }

    public record Activity(String id, String icon, String text, LocalDate date) {
    }

    public record StudentRow(@JsonUnwrapped StudentDto student, List<String> courseIds, List<String> courseTitles,
                             int averageProgress) {
    }

    public record StudentDetails(StudentDto student, List<EnrollmentRowDto> enrollments, LoginDetails login) {
    }

    /** What the student signs in with. password is null when no readable copy exists (reset it to see it). */
    public record LoginDetails(String username, String password) {
    }

    public record CourseRow(@JsonUnwrapped CourseDto course, long studentCount, long moduleCount, long lectureCount,
                            long resourceCount) {
    }

    public record ModuleRow(@JsonUnwrapped ModuleDto module, long lectureCount) {
    }

    /** One row per enrollment. status: Eligible | Issued | Revoked | In progress. */
    public record CertificateRow(String id, String studentId, String studentName, String courseId,
                                 String courseTitle, ProgressDto progress, boolean eligible, String status,
                                 CertificateDto certificate) {
    }

    // ---------- Requests ----------

    /** email is the student's login username. password: required when adding, optional when editing (reset). */
    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StudentRequest(String name, String email, String password, String phone, String city, String batch,
                                 String status) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CourseRequest(String title, String code, String category, String level, String instructor,
                                Object durationWeeks, String description, String status) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record StatusRequest(String status) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ModuleRequest(String title, Object order) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record MoveRequest(Integer direction) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record LectureRequest(String moduleId, String title, String description, Object order,
                                 Object durationMinutes, String videoUrl, String oneDriveItemId) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record ResourceRequest(String title, String description, String type, String moduleId, String lectureId,
                                  Object sizeKb, String fileUrl) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record EnrollmentRequest(String studentId, String courseId, String status) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record AnnouncementRequest(String title, String message, String courseId, Object pinned) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record PinRequest(Boolean pinned) {
    }

    @JsonIgnoreProperties(ignoreUnknown = true)
    public record CertificateIssueRequest(String studentId, String courseId) {
    }
}
