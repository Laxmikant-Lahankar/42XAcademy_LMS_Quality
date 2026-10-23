package com.academy42x.lms.dto;

import com.academy42x.lms.entity.Lecture;

public record LectureDto(String id, String courseId, String moduleId, String title, String description,
                         int order, int durationMinutes, String videoUrl, String oneDriveItemId) {

    public static LectureDto from(Lecture lecture) {
        return new LectureDto(lecture.getId(), lecture.getCourseId(), lecture.getModuleId(), lecture.getTitle(),
                lecture.getDescription() == null ? "" : lecture.getDescription(), lecture.getSortOrder(),
                lecture.getDurationMinutes(), lecture.getVideoUrl(), lecture.getOneDriveItemId());
    }
}
