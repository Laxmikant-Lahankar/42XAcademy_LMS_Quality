package com.academy42x.lms.service.admin;

import com.academy42x.lms.dto.CourseDto;
import com.academy42x.lms.dto.EnrollmentRowDto;
import com.academy42x.lms.dto.StudentDto;
import com.academy42x.lms.dto.admin.AdminDtos;
import com.academy42x.lms.entity.Course;
import com.academy42x.lms.entity.Enrollment;
import com.academy42x.lms.entity.User;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.repository.CourseModuleRepository;
import com.academy42x.lms.repository.CourseRepository;
import com.academy42x.lms.repository.EnrollmentRepository;
import com.academy42x.lms.repository.LearningResourceRepository;
import com.academy42x.lms.repository.LectureRepository;
import com.academy42x.lms.repository.UserRepository;
import com.academy42x.lms.util.Ids;
import com.academy42x.lms.util.Inputs;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Courses and each course's own student list. */
@Service
@Transactional(readOnly = true)
public class AdminCourseService {

    public static final List<String> CATEGORIES = List.of("SAP", "Data", "Power Platform", "DevOps");

    private final CourseRepository courses;
    private final CourseModuleRepository modules;
    private final LectureRepository lectures;
    private final LearningResourceRepository resources;
    private final EnrollmentRepository enrollments;
    private final UserRepository users;
    private final AdminSupport support;

    public AdminCourseService(CourseRepository courses, CourseModuleRepository modules, LectureRepository lectures,
                              LearningResourceRepository resources, EnrollmentRepository enrollments,
                              UserRepository users, AdminSupport support) {
        this.courses = courses;
        this.modules = modules;
        this.lectures = lectures;
        this.resources = resources;
        this.enrollments = enrollments;
        this.users = users;
        this.support = support;
    }

    public List<AdminDtos.CourseRow> courses() {
        return courses.findAllByOrderByTitleAsc().stream().map(this::row).toList();
    }

    public AdminDtos.CourseRow course(String courseId) {
        return row(support.requireCourse(courseId));
    }

    private AdminDtos.CourseRow row(Course course) {
        String id = course.getId();
        return new AdminDtos.CourseRow(CourseDto.from(course), enrollments.countByCourseId(id),
                modules.countByCourseId(id), lectures.countByCourseId(id), resources.countByCourseId(id));
    }

    @Transactional
    public CourseDto create(AdminDtos.CourseRequest request) {
        String code = Inputs.requireText(request.code(), "Course code").toUpperCase(Locale.ROOT);
        String id = Ids.slugify(code);
        if (id.isEmpty()) {
            throw ApiException.badRequest("Course code must contain letters or numbers.");
        }
        if (courses.existsById(id) || courses.existsByCodeIgnoreCase(code)) {
            throw ApiException.conflict("A course with this code already exists.");
        }

        Course course = new Course();
        course.setId(id);
        course.setCode(code);
        apply(course, request);
        return CourseDto.from(courses.save(course));
    }

    /** The code is fixed after creation because it forms the course link. */
    @Transactional
    public CourseDto update(String courseId, AdminDtos.CourseRequest request) {
        Course course = support.requireCourse(courseId);
        apply(course, request);
        return CourseDto.from(courses.save(course));
    }

    private void apply(Course course, AdminDtos.CourseRequest request) {
        course.setTitle(Inputs.requireText(request.title(), "Title"));
        course.setCategory(Inputs.oneOf(request.category(), "SAP", CATEGORIES.toArray(String[]::new)));
        String level = Inputs.text(request.level());
        course.setLevel(level.isEmpty() ? "Beginner" : level);
        course.setInstructor(Inputs.text(request.instructor()));
        course.setDurationWeeks(Inputs.toInt(request.durationWeeks(), 0));
        course.setDescription(Inputs.text(request.description()));
        course.setStatus(Inputs.oneOf(request.status(), Course.STATUS_DRAFT, Course.STATUS_PUBLISHED, Course.STATUS_DRAFT));
    }

    @Transactional
    public CourseDto setStatus(String courseId, String status) {
        Course course = support.requireCourse(courseId);
        course.setStatus(Inputs.oneOf(status, course.getStatus(), Course.STATUS_PUBLISHED, Course.STATUS_DRAFT));
        return CourseDto.from(courses.save(course));
    }

    /** Modules, lectures, resources and course announcements are removed by ON DELETE CASCADE. */
    @Transactional
    public void delete(String courseId) {
        Course course = support.requireCourse(courseId);
        if (enrollments.existsByCourseId(courseId)) {
            throw ApiException.conflict("This course has enrolled students. Remove them first or set the course to Draft.");
        }
        courses.delete(course);
    }

    // ---------- Course → Students ----------

    public List<EnrollmentRowDto> courseStudents(String courseId) {
        support.requireCourse(courseId);
        return support.enrollmentRows(enrollments.findByCourseId(courseId));
    }

    /** Academy students who are NOT yet enrolled in this course. */
    public List<StudentDto> availableStudents(String courseId) {
        support.requireCourse(courseId);
        Set<String> enrolled = enrollments.findByCourseId(courseId).stream()
                .map(Enrollment::getStudentId)
                .collect(Collectors.toSet());
        return users.findByRoleOrderByNameAsc(User.ROLE_STUDENT).stream()
                .filter(student -> !enrolled.contains(student.getId()))
                .map(StudentDto::from)
                .toList();
    }
}
