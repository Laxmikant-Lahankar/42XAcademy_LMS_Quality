package com.academy42x.lms.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;

/** A course as a student sees it: course fields plus progress and the next lecture to watch. */
public record CourseSummaryDto(@JsonUnwrapped CourseDto course, ProgressDto progress, int moduleCount,
                               int totalMinutes, String nextLectureId) {
}
