package com.academy42x.lms.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;

/** A lecture plus whether the current student has completed it. */
public record StudentLectureDto(@JsonUnwrapped LectureDto lecture, boolean completed) {
}
