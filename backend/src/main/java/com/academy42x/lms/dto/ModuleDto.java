package com.academy42x.lms.dto;

import com.academy42x.lms.entity.CourseModule;

public record ModuleDto(String id, String courseId, String title, int order) {

    public static ModuleDto from(CourseModule module) {
        return new ModuleDto(module.getId(), module.getCourseId(), module.getTitle(), module.getSortOrder());
    }
}
