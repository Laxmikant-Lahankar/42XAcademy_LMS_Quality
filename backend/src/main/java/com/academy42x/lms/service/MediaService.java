package com.academy42x.lms.service;

import com.academy42x.lms.dto.UrlDto;
import com.academy42x.lms.entity.Enrollment;
import com.academy42x.lms.entity.LearningResource;
import com.academy42x.lms.entity.Lecture;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.repository.CourseRepository;
import com.academy42x.lms.repository.EnrollmentRepository;
import com.academy42x.lms.repository.LearningResourceRepository;
import com.academy42x.lms.repository.LectureRepository;
import com.academy42x.lms.security.AccessGuard;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Video and file links.
 *
 * ONEDRIVE INTEGRATION POINT (not built yet):
 * Today this returns the link the admin saved (video_url / file_url), or null.
 * Later: use Microsoft Graph with the backend's own app credentials to turn
 * onedrive_item_id into a short-lived, protected URL for the logged-in student.
 * Only this class needs to change — the frontend already calls these endpoints.
 */
@Service
@Transactional(readOnly = true)
public class MediaService {

    private final LectureRepository lectures;
    private final LearningResourceRepository resources;
    private final EnrollmentRepository enrollments;
    private final CourseRepository courses;

    public MediaService(LectureRepository lectures, LearningResourceRepository resources,
                        EnrollmentRepository enrollments, CourseRepository courses) {
        this.lectures = lectures;
        this.resources = resources;
        this.enrollments = enrollments;
        this.courses = courses;
    }

    public UrlDto lectureStreamUrl(Jwt user, String lectureId) {
        Lecture lecture = lectures.findById(lectureId)
                .orElseThrow(() -> ApiException.notFound("This lecture could not be found."));
        requireAccess(user, lecture.getCourseId());
        return new UrlDto(lecture.getVideoUrl());
    }

    public UrlDto resourceDownloadUrl(Jwt user, String resourceId) {
        LearningResource resource = resources.findById(resourceId)
                .orElseThrow(() -> ApiException.notFound("This file could not be found."));
        requireAccess(user, resource.getCourseId());
        return new UrlDto(resource.getFileUrl());
    }

    /** Admins can open everything; students only files of published courses they are enrolled in. */
    private void requireAccess(Jwt user, String courseId) {
        if (AccessGuard.isAdmin(user)) {
            return;
        }
        boolean enrolled = enrollments.findByStudentIdAndCourseId(user.getSubject(), courseId)
                .filter(e -> !Enrollment.STATUS_CANCELLED.equals(e.getStatus()))
                .isPresent();
        boolean published = courses.findById(courseId).map(c -> c.isPublished()).orElse(false);
        if (!enrolled || !published) {
            throw ApiException.forbidden("You are not enrolled in this course.");
        }
    }
}
