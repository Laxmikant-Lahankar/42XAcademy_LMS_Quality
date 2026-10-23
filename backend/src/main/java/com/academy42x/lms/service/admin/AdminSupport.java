package com.academy42x.lms.service.admin;

import com.academy42x.lms.dto.EnrollmentDto;
import com.academy42x.lms.dto.EnrollmentRowDto;
import com.academy42x.lms.entity.Course;
import com.academy42x.lms.entity.Enrollment;
import com.academy42x.lms.entity.Lecture;
import com.academy42x.lms.entity.LectureProgress;
import com.academy42x.lms.entity.User;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.repository.CourseRepository;
import com.academy42x.lms.repository.LectureProgressRepository;
import com.academy42x.lms.repository.LectureRepository;
import com.academy42x.lms.repository.UserRepository;
import com.academy42x.lms.service.ProgressCalculator;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.function.Function;
import java.util.stream.Collectors;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

/** Helpers shared by the admin services (lookups and enrollment rows with progress). */
@Component
@Transactional(readOnly = true)
public class AdminSupport {

    private final UserRepository users;
    private final CourseRepository courses;
    private final LectureRepository lectures;
    private final LectureProgressRepository progress;

    public AdminSupport(UserRepository users, CourseRepository courses, LectureRepository lectures,
                        LectureProgressRepository progress) {
        this.users = users;
        this.courses = courses;
        this.lectures = lectures;
        this.progress = progress;
    }

    public Course requireCourse(String courseId) {
        return courses.findById(courseId).orElseThrow(() -> ApiException.notFound("This course could not be found."));
    }

    public User requireStudent(String studentId) {
        return users.findById(studentId)
                .filter(u -> User.ROLE_STUDENT.equals(u.getRole()))
                .orElseThrow(() -> ApiException.notFound("This student could not be found."));
    }

    /** Enrollment rows (newest first) with student / course names and the student's progress in that course. */
    public List<EnrollmentRowDto> enrollmentRows(List<Enrollment> enrollments) {
        if (enrollments.isEmpty()) {
            return List.of();
        }
        Set<String> studentIds = enrollments.stream().map(Enrollment::getStudentId).collect(Collectors.toSet());
        Set<String> courseIds = enrollments.stream().map(Enrollment::getCourseId).collect(Collectors.toSet());

        Map<String, User> studentById = users.findAllById(studentIds).stream()
                .collect(Collectors.toMap(User::getId, Function.identity()));
        Map<String, Course> courseById = courses.findAllById(courseIds).stream()
                .collect(Collectors.toMap(Course::getId, Function.identity()));
        Map<String, List<Lecture>> lecturesByCourse = lectures.findByCourseIdIn(courseIds).stream()
                .collect(Collectors.groupingBy(Lecture::getCourseId));
        Map<String, Set<String>> completedByStudent = progress.findByStudentIdIn(studentIds).stream()
                .collect(Collectors.groupingBy(LectureProgress::getStudentId,
                        Collectors.mapping(LectureProgress::getLectureId, Collectors.toSet())));

        return enrollments.stream()
                .sorted(Comparator.comparing(Enrollment::getEnrolledOn).reversed().thenComparing(Enrollment::getId))
                .map(e -> {
                    User student = studentById.get(e.getStudentId());
                    Course course = courseById.get(e.getCourseId());
                    return new EnrollmentRowDto(
                            EnrollmentDto.from(e),
                            student == null ? "Unknown student" : student.getName(),
                            student == null ? "" : student.getEmail(),
                            student == null ? User.STATUS_ACTIVE : student.getStatus(),
                            course == null ? "Unknown course" : course.getTitle(),
                            ProgressCalculator.progress(lecturesByCourse.getOrDefault(e.getCourseId(), List.of()),
                                    completedByStudent.getOrDefault(e.getStudentId(), Set.of())));
                })
                .toList();
    }
}
