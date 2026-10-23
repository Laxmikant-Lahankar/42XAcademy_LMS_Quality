package com.academy42x.lms.dto;

import com.academy42x.lms.entity.Announcement;
import java.time.LocalDate;

/** courseTitle is null for academy-wide announcements. */
public record AnnouncementDto(String id, String title, String message, String courseId, boolean pinned,
                              String postedBy, LocalDate postedOn, String courseTitle) {

    public static AnnouncementDto from(Announcement announcement, String courseTitle) {
        return new AnnouncementDto(announcement.getId(), announcement.getTitle(), announcement.getMessage(),
                announcement.getCourseId(), announcement.isPinned(), announcement.getPostedBy(),
                announcement.getPostedOn(), courseTitle);
    }
}
