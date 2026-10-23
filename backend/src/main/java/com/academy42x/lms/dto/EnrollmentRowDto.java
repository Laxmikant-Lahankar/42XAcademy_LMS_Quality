package com.academy42x.lms.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;

/** An enrollment with student / course names and the student's progress in that course. */
public record EnrollmentRowDto(@JsonUnwrapped EnrollmentDto enrollment, String studentName, String studentEmail,
                               String studentStatus, String courseTitle, ProgressDto progress) {
}
