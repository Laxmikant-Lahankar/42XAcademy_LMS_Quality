package com.academy42x.lms.dto;

import com.academy42x.lms.entity.Course;

public record CourseDto(String id, String code, String title, String category, String level,
                        String instructor, int durationWeeks, String description, String status) {

    public static CourseDto from(Course course) {
        return new CourseDto(course.getId(), course.getCode(), course.getTitle(), course.getCategory(),
                course.getLevel(), course.getInstructor(), course.getDurationWeeks(),
                course.getDescription() == null ? "" : course.getDescription(), course.getStatus());
    }
}
