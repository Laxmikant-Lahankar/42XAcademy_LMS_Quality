package com.academy42x.lms.service.admin;

import com.academy42x.lms.dto.EnrollmentDto;
import com.academy42x.lms.dto.EnrollmentRowDto;
import com.academy42x.lms.dto.admin.AdminDtos;
import com.academy42x.lms.entity.Enrollment;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.repository.EnrollmentRepository;
import com.academy42x.lms.util.SequentialIds;
import com.academy42x.lms.util.Inputs;
import java.time.LocalDate;
import java.util.List;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Enrollments: one student ↔ one specific course. A student can have several. */
@Service
@Transactional(readOnly = true)
public class AdminEnrollmentService {

    private static final String[] STATUSES = {"Active", "Paused", "Completed", "Cancelled"};

    private final EnrollmentRepository enrollments;
    private final AdminSupport support;
    private final SequentialIds ids;

    public AdminEnrollmentService(EnrollmentRepository enrollments, AdminSupport support, SequentialIds ids) {
        this.enrollments = enrollments;
        this.support = support;
        this.ids = ids;
    }

    public List<EnrollmentRowDto> enrollments() {
        return support.enrollmentRows(enrollments.findAll());
    }

    @Transactional
    public EnrollmentDto create(AdminDtos.EnrollmentRequest request) {
        String studentId = Inputs.requireText(request.studentId(), "Student");
        String courseId = Inputs.requireText(request.courseId(), "Course");
        support.requireStudent(studentId);
        support.requireCourse(courseId);

        if (enrollments.findByStudentIdAndCourseId(studentId, courseId).isPresent()) {
            throw ApiException.conflict("This student is already enrolled in this course.");
        }

        Enrollment enrollment = new Enrollment();
        enrollment.setId(ids.enrollment());
        enrollment.setStudentId(studentId);
        enrollment.setCourseId(courseId);
        enrollment.setEnrolledOn(LocalDate.now());
        enrollment.setStatus(Inputs.oneOf(request.status(), Enrollment.STATUS_ACTIVE, STATUSES));
        return EnrollmentDto.from(enrollments.save(enrollment));
    }

    /** Only the status can change; the student and course of an enrollment are fixed. */
    @Transactional
    public EnrollmentDto updateStatus(String enrollmentId, AdminDtos.EnrollmentRequest request) {
        Enrollment enrollment = require(enrollmentId);
        enrollment.setStatus(Inputs.oneOf(request.status(), enrollment.getStatus(), STATUSES));
        return EnrollmentDto.from(enrollments.save(enrollment));
    }

    @Transactional
    public void delete(String enrollmentId) {
        enrollments.delete(require(enrollmentId));
    }

    private Enrollment require(String enrollmentId) {
        return enrollments.findById(enrollmentId)
                .orElseThrow(() -> ApiException.notFound("This enrollment could not be found."));
    }
}
