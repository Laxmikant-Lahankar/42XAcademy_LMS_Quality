package com.academy42x.lms.dto;

import com.academy42x.lms.entity.LearningResource;
import java.time.LocalDate;

public record ResourceDto(String id, String courseId, String moduleId, String lectureId, String title,
                          String description, String type, int sizeKb, String fileUrl, LocalDate updatedOn) {

    public static ResourceDto from(LearningResource resource) {
        return new ResourceDto(resource.getId(), resource.getCourseId(), resource.getModuleId(),
                resource.getLectureId(), resource.getTitle(),
                resource.getDescription() == null ? "" : resource.getDescription(), resource.getType(),
                resource.getSizeKb(), resource.getFileUrl(), resource.getUpdatedOn());
    }
}
