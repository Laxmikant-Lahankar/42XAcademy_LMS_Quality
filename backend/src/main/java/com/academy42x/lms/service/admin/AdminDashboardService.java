package com.academy42x.lms.service.admin;

import com.academy42x.lms.dto.admin.AdminDtos;
import com.academy42x.lms.entity.Certificate;
import com.academy42x.lms.entity.Course;
import com.academy42x.lms.entity.User;
import com.academy42x.lms.repository.AnnouncementRepository;
import com.academy42x.lms.repository.CertificateRepository;
import com.academy42x.lms.repository.CourseRepository;
import com.academy42x.lms.repository.EnrollmentRepository;
import com.academy42x.lms.repository.UserRepository;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Admin dashboard: four totals and a recent-activity feed built from dated records. */
@Service
@Transactional(readOnly = true)
public class AdminDashboardService {

    private final UserRepository users;
    private final CourseRepository courses;
    private final EnrollmentRepository enrollments;
    private final AnnouncementRepository announcements;
    private final CertificateRepository certificates;

    public AdminDashboardService(UserRepository users, CourseRepository courses, EnrollmentRepository enrollments,
                                 AnnouncementRepository announcements, CertificateRepository certificates) {
        this.users = users;
        this.courses = courses;
        this.enrollments = enrollments;
        this.announcements = announcements;
        this.certificates = certificates;
    }

    public AdminDtos.Dashboard dashboard() {
        AdminDtos.Stats stats = new AdminDtos.Stats(
                users.countByRole(User.ROLE_STUDENT),
                users.countByRoleAndStatus(User.ROLE_STUDENT, User.STATUS_ACTIVE),
                courses.count(),
                courses.countByStatus(Course.STATUS_PUBLISHED),
                enrollments.count());
        return new AdminDtos.Dashboard(stats, recentActivity());
    }

    private List<AdminDtos.Activity> recentActivity() {
        Map<String, User> userById = users.findAll().stream().collect(Collectors.toMap(User::getId, Function.identity()));
        Map<String, Course> courseById = courses.findAll().stream().collect(Collectors.toMap(Course::getId, Function.identity()));
        Function<String, String> studentName = id -> userById.containsKey(id) ? userById.get(id).getName() : "A student";
        Function<String, String> courseTitle = id -> courseById.containsKey(id) ? courseById.get(id).getTitle() : "a course";

        List<AdminDtos.Activity> items = new ArrayList<>();
        enrollments.findAll().forEach(e -> items.add(new AdminDtos.Activity("a-" + e.getId(), "user-plus",
                studentName.apply(e.getStudentId()) + " enrolled in " + courseTitle.apply(e.getCourseId()), e.getEnrolledOn())));
        announcements.findAll().forEach(a -> items.add(new AdminDtos.Activity("a-" + a.getId(), "megaphone",
                "Announcement posted: “" + a.getTitle() + "”", a.getPostedOn())));
        certificates.findAll().stream()
                .filter(c -> Certificate.STATUS_ISSUED.equals(c.getStatus()) && c.getIssuedOn() != null)
                .forEach(c -> items.add(new AdminDtos.Activity("a-" + c.getId(), "award",
                        "Certificate issued to " + studentName.apply(c.getStudentId()) + " for " + courseTitle.apply(c.getCourseId()),
                        c.getIssuedOn())));
        userById.values().stream()
                .filter(u -> User.ROLE_STUDENT.equals(u.getRole()))
                .forEach(u -> items.add(new AdminDtos.Activity("a-" + u.getId(), "user",
                        "New student added: " + u.getName(), u.getJoinedOn())));

        return items.stream()
                .sorted(Comparator.comparing(AdminDtos.Activity::date).reversed())
                .limit(8)
                .toList();
    }
}
