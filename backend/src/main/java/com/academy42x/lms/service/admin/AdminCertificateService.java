package com.academy42x.lms.service.admin;

import com.academy42x.lms.dto.CertificateDto;
import com.academy42x.lms.dto.EnrollmentRowDto;
import com.academy42x.lms.dto.admin.AdminDtos;
import com.academy42x.lms.entity.Certificate;
import com.academy42x.lms.entity.Course;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.repository.CertificateRepository;
import com.academy42x.lms.repository.EnrollmentRepository;
import com.academy42x.lms.util.SequentialIds;
import com.academy42x.lms.util.Inputs;
import java.security.SecureRandom;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Course certificates. A student is eligible when every lecture of the course is completed.
 * PDF generation is not built yet (the frontend shows a message).
 */
@Service
@Transactional(readOnly = true)
public class AdminCertificateService {

    private static final SecureRandom RANDOM = new SecureRandom();

    private final CertificateRepository certificates;
    private final EnrollmentRepository enrollments;
    private final AdminSupport support;
    private final SequentialIds ids;

    public AdminCertificateService(CertificateRepository certificates, EnrollmentRepository enrollments,
                                   AdminSupport support, SequentialIds ids) {
        this.certificates = certificates;
        this.enrollments = enrollments;
        this.support = support;
        this.ids = ids;
    }

    /** One row per enrollment: Eligible | Issued | Revoked | In progress. */
    public List<AdminDtos.CertificateRow> certificates() {
        Map<String, Certificate> byStudentCourse = certificates.findAll().stream()
                .collect(Collectors.toMap(c -> c.getStudentId() + "|" + c.getCourseId(), Function.identity()));

        return support.enrollmentRows(enrollments.findAll()).stream()
                .map(row -> toRow(row, byStudentCourse.get(row.enrollment().studentId() + "|" + row.enrollment().courseId())))
                .toList();
    }

    private AdminDtos.CertificateRow toRow(EnrollmentRowDto row, Certificate certificate) {
        boolean eligible = row.progress().percent() == 100;
        String status = eligible ? "Eligible" : "In progress";
        if (certificate != null) {
            status = certificate.getStatus();
        }
        return new AdminDtos.CertificateRow(row.enrollment().id(), row.enrollment().studentId(), row.studentName(),
                row.enrollment().courseId(), row.courseTitle(), row.progress(), eligible, status,
                CertificateDto.from(certificate));
    }

    @Transactional
    public CertificateDto issue(AdminDtos.CertificateIssueRequest request) {
        String studentId = Inputs.requireText(request.studentId(), "Student");
        String courseId = Inputs.requireText(request.courseId(), "Course");
        Course course = support.requireCourse(courseId);

        EnrollmentRowDto row = enrollments.findByStudentIdAndCourseId(studentId, courseId)
                .map(e -> support.enrollmentRows(List.of(e)).get(0))
                .orElseThrow(() -> ApiException.badRequest("This student is not enrolled in this course."));
        if (row.progress().percent() < 100) {
            throw ApiException.badRequest("The student has not completed this course yet.");
        }

        Certificate certificate = certificates.findByStudentIdAndCourseId(studentId, courseId).orElseGet(() -> {
            Certificate created = new Certificate();
            created.setId(ids.certificate());
            created.setStudentId(studentId);
            created.setCourseId(courseId);
            return created;
        });
        certificate.setStatus(Certificate.STATUS_ISSUED);
        certificate.setIssuedOn(LocalDate.now());
        certificate.setCertificateNo(certificateNumber(course));
        return CertificateDto.from(certificates.save(certificate));
    }

    /** The record is kept with status Revoked so the history stays visible. */
    @Transactional
    public CertificateDto revoke(String certificateId) {
        Certificate certificate = certificates.findById(certificateId)
                .orElseThrow(() -> ApiException.notFound("This certificate could not be found."));
        certificate.setStatus(Certificate.STATUS_REVOKED);
        return CertificateDto.from(certificates.save(certificate));
    }

    private static String certificateNumber(Course course) {
        String prefix = course.getCode().split("-")[0];
        return "42X-" + prefix + "-" + LocalDate.now().getYear() + "-" + (1000 + RANDOM.nextInt(9000));
    }
}
