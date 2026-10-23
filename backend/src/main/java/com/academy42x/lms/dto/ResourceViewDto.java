package com.academy42x.lms.dto;

import com.fasterxml.jackson.annotation.JsonUnwrapped;

/** A resource with the names of its course / module / lecture, for lists. */
public record ResourceViewDto(@JsonUnwrapped ResourceDto resource, String courseTitle, String moduleTitle,
                              String lectureTitle) {
}
