package com.academy42x.lms.controller.admin;

import com.academy42x.lms.dto.AnnouncementDto;
import com.academy42x.lms.dto.CertificateDto;
import com.academy42x.lms.dto.EnrollmentDto;
import com.academy42x.lms.dto.EnrollmentRowDto;
import com.academy42x.lms.dto.StudentDto;
import com.academy42x.lms.dto.admin.AdminDtos;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.security.AccessGuard;
import com.academy42x.lms.service.admin.AdminAnnouncementService;
import com.academy42x.lms.service.admin.AdminCertificateService;
import com.academy42x.lms.service.admin.AdminDashboardService;
import com.academy42x.lms.service.admin.AdminEnrollmentService;
import com.academy42x.lms.service.admin.AdminStudentService;
import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * /api/admin — academy-wide admin endpoints:
 * dashboard, students, enrollments, announcements and certificates.
 * (Courses and their content: see AdminCourseController.)
 */
@RestController
@RequestMapping("/admin")
public class AdminAcademyController {

    private final AdminDashboardService dashboardService;
    private final AdminStudentService studentService;
    private final AdminEnrollmentService enrollmentService;
    private final AdminAnnouncementService announcementService;
    private final AdminCertificateService certificateService;

    public AdminAcademyController(AdminDashboardService dashboardService, AdminStudentService studentService,
                                  AdminEnrollmentService enrollmentService,
                                  AdminAnnouncementService announcementService,
                                  AdminCertificateService certificateService) {
        this.dashboardService = dashboardService;
        this.studentService = studentService;
        this.enrollmentService = enrollmentService;
        this.announcementService = announcementService;
        this.certificateService = certificateService;
    }

    @GetMapping("/dashboard")
    public AdminDtos.Dashboard dashboard() {
        return dashboardService.dashboard();
    }

    // ---------- Students ----------

    @GetMapping("/students")
    public List<AdminDtos.StudentRow> students() {
        return studentService.students();
    }

    @GetMapping("/students/{studentId}")
    public AdminDtos.StudentDetails student(@PathVariable String studentId) {
        return studentService.details(studentId);
    }

    @PostMapping("/students")
    @ResponseStatus(HttpStatus.CREATED)
    public StudentDto createStudent(@RequestBody AdminDtos.StudentRequest request) {
        return studentService.create(request);
    }

    @PutMapping("/students/{studentId}")
    public StudentDto updateStudent(@PathVariable String studentId, @RequestBody AdminDtos.StudentRequest request) {
        return studentService.update(studentId, request);
    }

    /** Permanently deletes the student with their enrollments, progress and certificates. */
    @DeleteMapping("/students/{studentId}")
    public ResponseEntity<Void> deleteStudent(@PathVariable String studentId) {
        studentService.delete(studentId);
        return ResponseEntity.noContent().build();
    }

    // ---------- Enrollments ----------

    @GetMapping("/enrollments")
    public List<EnrollmentRowDto> enrollments() {
        return enrollmentService.enrollments();
    }

    @PostMapping("/enrollments")
    @ResponseStatus(HttpStatus.CREATED)
    public EnrollmentDto createEnrollment(@RequestBody AdminDtos.EnrollmentRequest request) {
        return enrollmentService.create(request);
    }

    @PutMapping("/enrollments/{enrollmentId}")
    public EnrollmentDto updateEnrollment(@PathVariable String enrollmentId,
                                          @RequestBody AdminDtos.EnrollmentRequest request) {
        return enrollmentService.updateStatus(enrollmentId, request);
    }

    @DeleteMapping("/enrollments/{enrollmentId}")
    public ResponseEntity<Void> deleteEnrollment(@PathVariable String enrollmentId) {
        enrollmentService.delete(enrollmentId);
        return ResponseEntity.noContent().build();
    }

    // ---------- Announcements ----------

    @GetMapping("/announcements")
    public List<AnnouncementDto> announcements() {
        return announcementService.announcements();
    }

    @PostMapping("/announcements")
    @ResponseStatus(HttpStatus.CREATED)
    public AnnouncementDto createAnnouncement(@AuthenticationPrincipal Jwt jwt,
                                              @RequestBody AdminDtos.AnnouncementRequest request) {
        return announcementService.create(request, AccessGuard.displayName(jwt));
    }

    @PutMapping("/announcements/{announcementId}")
    public AnnouncementDto updateAnnouncement(@PathVariable String announcementId,
                                              @RequestBody AdminDtos.AnnouncementRequest request) {
        return announcementService.update(announcementId, request);
    }

    /** Pin / unpin. */
    @PatchMapping("/announcements/{announcementId}")
    public AnnouncementDto pinAnnouncement(@PathVariable String announcementId,
                                           @RequestBody AdminDtos.PinRequest request) {
        return announcementService.setPinned(announcementId, Boolean.TRUE.equals(request.pinned()));
    }

    @DeleteMapping("/announcements/{announcementId}")
    public ResponseEntity<Void> deleteAnnouncement(@PathVariable String announcementId) {
        announcementService.delete(announcementId);
        return ResponseEntity.noContent().build();
    }

    // ---------- Certificates ----------

    @GetMapping("/certificates")
    public List<AdminDtos.CertificateRow> certificates() {
        return certificateService.certificates();
    }

    @PostMapping("/certificates")
    @ResponseStatus(HttpStatus.CREATED)
    public CertificateDto issueCertificate(@RequestBody AdminDtos.CertificateIssueRequest request) {
        return certificateService.issue(request);
    }

    /** Only revoking is supported here ({ "status": "Revoked" }); issuing again uses POST. */
    @PatchMapping("/certificates/{certificateId}")
    public CertificateDto updateCertificate(@PathVariable String certificateId,
                                            @RequestBody Map<String, String> request) {
        if (!"Revoked".equals(request.get("status"))) {
            throw ApiException.badRequest("Only { \"status\": \"Revoked\" } is supported.");
        }
        return certificateService.revoke(certificateId);
    }
}
