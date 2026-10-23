package com.academy42x.lms.dto;

import com.academy42x.lms.entity.Enrollment;
import java.time.LocalDate;

public record EnrollmentDto(String id, String studentId, String courseId, LocalDate enrolledOn, String status) {

    public static EnrollmentDto from(Enrollment enrollment) {
        return new EnrollmentDto(enrollment.getId(), enrollment.getStudentId(), enrollment.getCourseId(),
                enrollment.getEnrolledOn(), enrollment.getStatus());
    }
}
