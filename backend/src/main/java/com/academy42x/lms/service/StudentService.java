package com.academy42x.lms.service;

import com.academy42x.lms.dto.AnnouncementDto;
import com.academy42x.lms.dto.CertificateDto;
import com.academy42x.lms.dto.CourseDto;
import com.academy42x.lms.dto.CourseSummaryDto;
import com.academy42x.lms.dto.LectureDto;
import com.academy42x.lms.dto.ModuleDto;
import com.academy42x.lms.dto.ResourceDto;
import com.academy42x.lms.dto.ResourceViewDto;
import com.academy42x.lms.dto.StudentDto;
import com.academy42x.lms.dto.StudentLectureDto;
import com.academy42x.lms.dto.student.StudentDtos;
import com.academy42x.lms.entity.Course;
import com.academy42x.lms.entity.CourseModule;
import com.academy42x.lms.entity.Enrollment;
import com.academy42x.lms.entity.LastWatched;
import com.academy42x.lms.entity.LearningResource;
import com.academy42x.lms.entity.Lecture;
import com.academy42x.lms.entity.LectureProgress;
import com.academy42x.lms.entity.StudentActivity;
import com.academy42x.lms.entity.User;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.repository.AnnouncementRepository;
import com.academy42x.lms.repository.CertificateRepository;
import com.academy42x.lms.repository.CourseModuleRepository;
import com.academy42x.lms.repository.CourseRepository;
import com.academy42x.lms.repository.EnrollmentRepository;
import com.academy42x.lms.repository.LastWatchedRepository;
import com.academy42x.lms.repository.LearningResourceRepository;
import com.academy42x.lms.repository.LectureProgressRepository;
import com.academy42x.lms.repository.LectureRepository;
import com.academy42x.lms.repository.StudentActivityRepository;
import com.academy42x.lms.repository.UserRepository;
import com.academy42x.lms.util.Inputs;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.Optional;
import java.util.Set;
import java.util.stream.Collectors;
import com.academy42x.lms.security.PasswordWriter;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Student panel logic. A student only sees courses they are enrolled in (not Cancelled)
 * that are Published.
 */
@Service
@Transactional(readOnly = true)
public class StudentService {

    private final UserRepository users;
    private final CourseRepository courses;
    private final CourseModuleRepository modules;
    private final LectureRepository lectures;
    private final LearningResourceRepository resources;
    private final EnrollmentRepository enrollments;
    private final LectureProgressRepository progress;
    private final LastWatchedRepository lastWatched;
    private final StudentActivityRepository activity;
    private final AnnouncementRepository announcements;
    private final CertificateRepository certificates;
    private final PasswordEncoder passwordEncoder;
    private final PasswordWriter passwords;

    public StudentService(UserRepository users, CourseRepository courses, CourseModuleRepository modules,
                          LectureRepository lectures, LearningResourceRepository resources,
                          EnrollmentRepository enrollments, LectureProgressRepository progress,
                          LastWatchedRepository lastWatched, StudentActivityRepository activity,
                          AnnouncementRepository announcements, CertificateRepository certificates,
                          PasswordEncoder passwordEncoder, PasswordWriter passwords) {
        this.users = users;
        this.courses = courses;
        this.modules = modules;
        this.lectures = lectures;
        this.resources = resources;
        this.enrollments = enrollments;
        this.progress = progress;
        this.lastWatched = lastWatched;
        this.activity = activity;
        this.announcements = announcements;
        this.certificates = certificates;
        this.passwordEncoder = passwordEncoder;
        this.passwords = passwords;
    }

    // ---------------------------------------------------------------------------------------------
    // Context: everything about the student's enrolled courses, loaded once per request
    // ---------------------------------------------------------------------------------------------

    private record Context(List<Course> courses, Map<String, List<CourseModule>> modulesByCourse,
                           Map<String, List<Lecture>> lecturesByCourse, Set<String> completed) {

        List<CourseModule> modules(String courseId) {
            return modulesByCourse.getOrDefault(courseId, List.of());
        }

        List<Lecture> lectures(String courseId) {
            return lecturesByCourse.getOrDefault(courseId, List.of());
        }

        Optional<Course> course(String courseId) {
            return courses.stream().filter(c -> c.getId().equals(courseId)).findFirst();
        }

        Set<String> courseIds() {
            return courses.stream().map(Course::getId).collect(Collectors.toSet());
        }
    }

    private Context load(String studentId) {
        User student = requireStudent(studentId);

        List<String> enrolledIds = enrollments.findByStudentId(student.getId()).stream()
                .filter(e -> !Enrollment.STATUS_CANCELLED.equals(e.getStatus()))
                .map(Enrollment::getCourseId)
                .toList();

        List<Course> visible = courses.findAllById(enrolledIds).stream()
                .filter(Course::isPublished)
                .sorted(Comparator.comparing(Course::getTitle))
                .toList();
        List<String> ids = visible.stream().map(Course::getId).toList();

        List<CourseModule> courseModules = ids.isEmpty() ? List.of() : modules.findByCourseIdIn(ids);
        Map<String, List<CourseModule>> modulesByCourse = courseModules.stream()
                .sorted(Comparator.comparingInt(CourseModule::getSortOrder))
                .collect(Collectors.groupingBy(CourseModule::getCourseId));

        List<Lecture> courseLectures = ids.isEmpty() ? List.of() : lectures.findByCourseIdIn(ids);
        Map<String, List<Lecture>> lecturesByCourse = ProgressCalculator
                .inCourseOrder(courseLectures, courseModules).stream()
                .collect(Collectors.groupingBy(Lecture::getCourseId));

        Set<String> completed = progress.findByStudentId(student.getId()).stream()
                .map(LectureProgress::getLectureId)
                .collect(Collectors.toSet());

        return new Context(visible, modulesByCourse, lecturesByCourse, completed);
    }

    private User requireStudent(String studentId) {
        return users.findById(studentId)
                .filter(u -> User.ROLE_STUDENT.equals(u.getRole()))
                .orElseThrow(() -> ApiException.notFound("Student profile not found."));
    }

    private CourseSummaryDto summary(Course course, Context ctx) {
        List<Lecture> courseLectures = ctx.lectures(course.getId());
        String nextLectureId = courseLectures.stream()
                .filter(l -> !ctx.completed().contains(l.getId()))
                .map(Lecture::getId)
                .findFirst()
                .orElse(null);
        int totalMinutes = courseLectures.stream().mapToInt(Lecture::getDurationMinutes).sum();

        return new CourseSummaryDto(CourseDto.from(course), ProgressCalculator.progress(courseLectures, ctx.completed()),
                ctx.modules(course.getId()).size(), totalMinutes, nextLectureId);
    }

    private StudentLectureDto withCompletion(Lecture lecture, Set<String> completed) {
        return new StudentLectureDto(LectureDto.from(lecture), completed.contains(lecture.getId()));
    }

    private List<AnnouncementDto> announcementsFor(Context ctx) {
        Set<String> ids = ctx.courseIds();
        Map<String, String> titles = ctx.courses().stream().collect(Collectors.toMap(Course::getId, Course::getTitle));

        return announcements.findAllByOrderByPinnedDescPostedOnDesc().stream()
                .filter(a -> a.getCourseId() == null || ids.contains(a.getCourseId()))
                .map(a -> AnnouncementDto.from(a, a.getCourseId() == null ? null : titles.get(a.getCourseId())))
                .toList();
    }

    // ---------------------------------------------------------------------------------------------
    // Endpoints
    // ---------------------------------------------------------------------------------------------

    public StudentDtos.Dashboard dashboard(String studentId) {
        Context ctx = load(studentId);
        List<CourseSummaryDto> summaries = ctx.courses().stream().map(c -> summary(c, ctx)).toList();

        int completed = summaries.stream().mapToInt(s -> s.progress().completed()).sum();
        int total = summaries.stream().mapToInt(s -> s.progress().total()).sum();
        int coursesCompleted = (int) summaries.stream().filter(s -> s.progress().percent() == 100).count();

        List<StudentDtos.Activity> recent = activity.findTop5ByStudentIdOrderByCreatedAtDescIdDesc(studentId).stream()
                .map(a -> new StudentDtos.Activity("act-" + a.getId(), a.getText(), a.getCreatedAt()))
                .toList();

        List<AnnouncementDto> latest = announcementsFor(ctx).stream().limit(3).toList();

        return new StudentDtos.Dashboard(summaries, continueLearning(studentId, ctx), recent, latest,
                new StudentDtos.Stats(summaries.size(), completed,
                        total == 0 ? 0 : Math.round(completed * 100f / total), coursesCompleted));
    }

    private StudentDtos.ContinueLearning continueLearning(String studentId, Context ctx) {
        return lastWatched.findById(studentId)
                .flatMap(last -> lectures.findById(last.getLectureId())
                        .flatMap(lecture -> ctx.course(lecture.getCourseId())
                                .map(course -> new StudentDtos.ContinueLearning(
                                        LectureDto.from(lecture),
                                        modules.findById(lecture.getModuleId()).map(ModuleDto::from).orElse(null),
                                        CourseDto.from(course),
                                        last.getWatchedAt()))))
                .orElse(null);
    }

    public StudentDtos.MyCourses myCourses(String studentId) {
        Context ctx = load(studentId);
        List<CourseSummaryDto> summaries = ctx.courses().stream().map(c -> summary(c, ctx)).toList();

        List<StudentDtos.LectureIndexItem> index = new ArrayList<>();
        for (Course course : ctx.courses()) {
            Map<String, String> moduleTitles = ctx.modules(course.getId()).stream()
                    .collect(Collectors.toMap(CourseModule::getId, CourseModule::getTitle));
            for (Lecture lecture : ctx.lectures(course.getId())) {
                index.add(new StudentDtos.LectureIndexItem(lecture.getId(), lecture.getTitle(), course.getId(),
                        course.getTitle(), moduleTitles.get(lecture.getModuleId())));
            }
        }
        return new StudentDtos.MyCourses(summaries, index);
    }

    public StudentDtos.CourseDetails courseDetails(String studentId, String courseId) {
        Context ctx = load(studentId);
        Course course = requireEnrolled(ctx, courseId);

        Map<String, List<Lecture>> byModule = ctx.lectures(courseId).stream()
                .collect(Collectors.groupingBy(Lecture::getModuleId));
        List<StudentDtos.ModuleWithLectures> moduleList = ctx.modules(courseId).stream()
                .map(m -> new StudentDtos.ModuleWithLectures(ModuleDto.from(m),
                        byModule.getOrDefault(m.getId(), List.of()).stream()
                                .sorted(Comparator.comparingInt(Lecture::getSortOrder))
                                .map(l -> withCompletion(l, ctx.completed()))
                                .toList()))
                .toList();

        List<ResourceDto> courseResources = resources.findByCourseIdOrderByUpdatedOnDesc(courseId).stream()
                .map(ResourceDto::from)
                .toList();
        ResourceDto syllabus = courseResources.stream()
                .filter(r -> "Syllabus".equals(r.type()))
                .findFirst()
                .orElse(null);

        return new StudentDtos.CourseDetails(summary(course, ctx), moduleList, courseResources, syllabus);
    }

    @Transactional
    public StudentDtos.LectureView lecture(String studentId, String courseId, String lectureId) {
        Context ctx = load(studentId);
        Course course = requireEnrolled(ctx, courseId);

        List<Lecture> ordered = ctx.lectures(courseId);
        int index = indexOf(ordered, lectureId);
        if (index < 0) {
            throw ApiException.notFound("This lecture could not be found.");
        }
        Lecture lecture = ordered.get(index);

        // Remember this as the last watched lecture ("Continue learning").
        LocalDateTime now = LocalDateTime.now();
        LastWatched last = lastWatched.findById(studentId).orElseGet(() -> new LastWatched(studentId, lectureId, now));
        last.setLectureId(lectureId);
        last.setWatchedAt(now);
        lastWatched.save(last);

        CourseModule module = ctx.modules(courseId).stream()
                .filter(m -> m.getId().equals(lecture.getModuleId()))
                .findFirst()
                .orElse(null);

        List<StudentLectureDto> moduleLectures = ordered.stream()
                .filter(l -> l.getModuleId().equals(lecture.getModuleId()))
                .map(l -> withCompletion(l, ctx.completed()))
                .toList();

        List<ResourceDto> moduleResources = resources.findByModuleId(lecture.getModuleId()).stream()
                .map(ResourceDto::from)
                .toList();

        return new StudentDtos.LectureView(
                CourseDto.from(course),
                module == null ? null : ModuleDto.from(module),
                withCompletion(lecture, ctx.completed()),
                index > 0 ? LectureDto.from(ordered.get(index - 1)) : null,
                index < ordered.size() - 1 ? LectureDto.from(ordered.get(index + 1)) : null,
                moduleLectures,
                moduleResources,
                new StudentDtos.Position(index + 1, ordered.size()));
    }

    @Transactional
    public StudentDtos.Completion setLectureComplete(String studentId, String lectureId, boolean completed) {
        Context ctx = load(studentId);
        Lecture lecture = lectures.findById(lectureId)
                .filter(l -> ctx.courseIds().contains(l.getCourseId()))
                .orElseThrow(() -> ApiException.notFound("This lecture could not be found."));

        LectureProgress.Key key = new LectureProgress.Key(studentId, lectureId);
        boolean already = progress.existsById(key);

        if (completed && !already) {
            progress.save(new LectureProgress(studentId, lectureId, LocalDateTime.now()));
            activity.save(new StudentActivity(studentId, "Completed “" + lecture.getTitle() + "”", LocalDateTime.now()));
        } else if (!completed && already) {
            progress.deleteById(key);
        }
        return new StudentDtos.Completion(lectureId, completed);
    }

    public List<ResourceViewDto> resources(String studentId) {
        Context ctx = load(studentId);
        Set<String> ids = ctx.courseIds();
        if (ids.isEmpty()) {
            return List.of();
        }
        Map<String, String> courseTitles = ctx.courses().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle));
        Map<String, String> moduleTitles = ctx.modulesByCourse().values().stream()
                .flatMap(List::stream)
                .collect(Collectors.toMap(CourseModule::getId, CourseModule::getTitle));

        return resources.findByCourseIdIn(ids).stream()
                .sorted(Comparator.comparing(LearningResource::getUpdatedOn).reversed())
                .map(r -> new ResourceViewDto(ResourceDto.from(r), courseTitles.get(r.getCourseId()),
                        r.getModuleId() == null ? null : moduleTitles.get(r.getModuleId()), null))
                .toList();
    }

    public StudentDtos.Progress progress(String studentId) {
        Context ctx = load(studentId);
        Map<String, CertificateDto> certificateByCourse = certificates.findByStudentId(studentId).stream()
                .collect(Collectors.toMap(c -> c.getCourseId(), CertificateDto::from));

        List<StudentDtos.CourseProgress> courseProgress = ctx.courses().stream()
                .map(course -> {
                    Map<String, List<Lecture>> byModule = ctx.lectures(course.getId()).stream()
                            .collect(Collectors.groupingBy(Lecture::getModuleId));
                    List<StudentDtos.ModuleProgress> moduleProgress = ctx.modules(course.getId()).stream()
                            .map(m -> {
                                List<Lecture> moduleLectures = byModule.getOrDefault(m.getId(), List.of());
                                int done = (int) moduleLectures.stream()
                                        .filter(l -> ctx.completed().contains(l.getId())).count();
                                return new StudentDtos.ModuleProgress(m.getId(), m.getTitle(), done, moduleLectures.size());
                            })
                            .toList();
                    return new StudentDtos.CourseProgress(summary(course, ctx), moduleProgress,
                            certificateByCourse.get(course.getId()));
                })
                .toList();

        StudentDtos.LastWatchedItem last = lastWatched.findById(studentId)
                .flatMap(l -> lectures.findById(l.getLectureId())
                        .flatMap(lecture -> ctx.course(lecture.getCourseId())
                                .map(course -> new StudentDtos.LastWatchedItem(LectureDto.from(lecture),
                                        CourseDto.from(course), l.getWatchedAt()))))
                .orElse(null);

        return new StudentDtos.Progress(courseProgress, last);
    }

    public List<AnnouncementDto> announcements(String studentId) {
        return announcementsFor(load(studentId));
    }

    public StudentDtos.Profile profile(String studentId) {
        Context ctx = load(studentId);
        User student = requireStudent(studentId);
        return new StudentDtos.Profile(StudentDto.from(student),
                ctx.courses().stream().map(c -> summary(c, ctx)).toList());
    }

    @Transactional
    public StudentDto updateProfile(String studentId, StudentDtos.ProfileUpdateRequest request) {
        User student = requireStudent(studentId);
        student.setPhone(Inputs.text(request.phone()));
        student.setCity(Inputs.text(request.city()));
        return StudentDto.from(users.save(student));
    }

    @Transactional
    public StudentDtos.ChangePasswordResponse changePassword(String studentId, StudentDtos.ChangePasswordRequest request) {
        User student = requireStudent(studentId);
        String current = request.currentPassword() == null ? "" : request.currentPassword();
        String next = request.newPassword() == null ? "" : request.newPassword();

        if (student.getPasswordHash() == null || !passwordEncoder.matches(current, student.getPasswordHash())) {
            throw ApiException.badRequest("Your current password is not correct.");
        }
        if (next.length() < 8) {
            throw ApiException.badRequest("The new password must be at least 8 characters.");
        }
        passwords.setPassword(student, next);
        users.save(student);
        return new StudentDtos.ChangePasswordResponse(true);
    }

    // ---------------------------------------------------------------------------------------------

    private Course requireEnrolled(Context ctx, String courseId) {
        return ctx.course(courseId).orElseThrow(() -> ApiException.forbidden("You are not enrolled in this course."));
    }

    private static int indexOf(List<Lecture> ordered, String lectureId) {
        for (int i = 0; i < ordered.size(); i++) {
            if (Objects.equals(ordered.get(i).getId(), lectureId)) {
                return i;
            }
        }
        return -1;
    }
}
