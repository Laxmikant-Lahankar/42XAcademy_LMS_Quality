package com.academy42x.lms.service.admin;

import com.academy42x.lms.dto.AnnouncementDto;
import com.academy42x.lms.dto.admin.AdminDtos;
import com.academy42x.lms.entity.Announcement;
import com.academy42x.lms.entity.Course;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.repository.AnnouncementRepository;
import com.academy42x.lms.repository.CourseRepository;
import com.academy42x.lms.util.SequentialIds;
import com.academy42x.lms.util.Inputs;
import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Academy-wide (courseId = null) or course-specific announcements. */
@Service
@Transactional(readOnly = true)
public class AdminAnnouncementService {

    private final AnnouncementRepository announcements;
    private final CourseRepository courses;
    private final AdminSupport support;
    private final SequentialIds ids;

    public AdminAnnouncementService(AnnouncementRepository announcements, CourseRepository courses,
                                    AdminSupport support, SequentialIds ids) {
        this.announcements = announcements;
        this.courses = courses;
        this.support = support;
        this.ids = ids;
    }

    public List<AnnouncementDto> announcements() {
        Map<String, String> titles = courses.findAll().stream().collect(Collectors.toMap(Course::getId, Course::getTitle));
        return announcements.findAllByOrderByPinnedDescPostedOnDesc().stream()
                .map(a -> AnnouncementDto.from(a, a.getCourseId() == null ? null : titles.get(a.getCourseId())))
                .toList();
    }

    @Transactional
    public AnnouncementDto create(AdminDtos.AnnouncementRequest request, String postedBy) {
        Announcement announcement = new Announcement();
        announcement.setId(ids.announcement());
        announcement.setPostedBy(postedBy);
        announcement.setPostedOn(LocalDate.now());
        apply(announcement, request);
        return toDto(announcements.save(announcement));
    }

    @Transactional
    public AnnouncementDto update(String announcementId, AdminDtos.AnnouncementRequest request) {
        Announcement announcement = require(announcementId);
        apply(announcement, request);
        return toDto(announcements.save(announcement));
    }

    @Transactional
    public AnnouncementDto setPinned(String announcementId, boolean pinned) {
        Announcement announcement = require(announcementId);
        announcement.setPinned(pinned);
        return toDto(announcements.save(announcement));
    }

    @Transactional
    public void delete(String announcementId) {
        announcements.delete(require(announcementId));
    }

    private void apply(Announcement announcement, AdminDtos.AnnouncementRequest request) {
        String courseId = Inputs.nullIfBlank(request.courseId());
        if (courseId != null) {
            support.requireCourse(courseId);
        }
        announcement.setTitle(Inputs.requireText(request.title(), "Title"));
        announcement.setMessage(Inputs.requireText(request.message(), "Message"));
        announcement.setCourseId(courseId);
        announcement.setPinned(Inputs.toBoolean(request.pinned()));
    }

    private AnnouncementDto toDto(Announcement announcement) {
        String title = announcement.getCourseId() == null ? null
                : courses.findById(announcement.getCourseId()).map(Course::getTitle).orElse(null);
        return AnnouncementDto.from(announcement, title);
    }

    private Announcement require(String announcementId) {
        return announcements.findById(announcementId)
                .orElseThrow(() -> ApiException.notFound("This announcement could not be found."));
    }
}
