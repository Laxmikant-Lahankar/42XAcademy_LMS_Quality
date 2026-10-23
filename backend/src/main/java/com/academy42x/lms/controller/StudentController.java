package com.academy42x.lms.controller;

import com.academy42x.lms.dto.AnnouncementDto;
import com.academy42x.lms.dto.ResourceViewDto;
import com.academy42x.lms.dto.StudentDto;
import com.academy42x.lms.dto.student.StudentDtos;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.security.AccessGuard;
import com.academy42x.lms.service.StudentService;
import java.util.List;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/** /api/students/{studentId}/… — the Student panel. A student can only open their own data. */
@RestController
@RequestMapping("/students/{studentId}")
public class StudentController {

    private final StudentService studentService;

    public StudentController(StudentService studentService) {
        this.studentService = studentService;
    }

    @GetMapping("/dashboard")
    public StudentDtos.Dashboard dashboard(@AuthenticationPrincipal Jwt jwt, @PathVariable String studentId) {
        AccessGuard.requireSelfOrAdmin(jwt, studentId);
        return studentService.dashboard(studentId);
    }

    @GetMapping("/courses")
    public StudentDtos.MyCourses courses(@AuthenticationPrincipal Jwt jwt, @PathVariable String studentId) {
        AccessGuard.requireSelfOrAdmin(jwt, studentId);
        return studentService.myCourses(studentId);
    }

    @GetMapping("/courses/{courseId}")
    public StudentDtos.CourseDetails course(@AuthenticationPrincipal Jwt jwt, @PathVariable String studentId,
                                            @PathVariable String courseId) {
        AccessGuard.requireSelfOrAdmin(jwt, studentId);
        return studentService.courseDetails(studentId, courseId);
    }

    @GetMapping("/courses/{courseId}/lectures/{lectureId}")
    public StudentDtos.LectureView lecture(@AuthenticationPrincipal Jwt jwt, @PathVariable String studentId,
                                           @PathVariable String courseId, @PathVariable String lectureId) {
        AccessGuard.requireSelfOrAdmin(jwt, studentId);
        return studentService.lecture(studentId, courseId, lectureId);
    }

    @PutMapping("/progress/lectures/{lectureId}")
    public StudentDtos.Completion setLectureComplete(@AuthenticationPrincipal Jwt jwt, @PathVariable String studentId,
                                                     @PathVariable String lectureId,
                                                     @RequestBody StudentDtos.CompletionRequest request) {
        AccessGuard.requireSelfOrAdmin(jwt, studentId);
        return studentService.setLectureComplete(studentId, lectureId, Boolean.TRUE.equals(request.completed()));
    }

    @GetMapping("/resources")
    public List<ResourceViewDto> resources(@AuthenticationPrincipal Jwt jwt, @PathVariable String studentId) {
        AccessGuard.requireSelfOrAdmin(jwt, studentId);
        return studentService.resources(studentId);
    }

    @GetMapping("/progress")
    public StudentDtos.Progress progress(@AuthenticationPrincipal Jwt jwt, @PathVariable String studentId) {
        AccessGuard.requireSelfOrAdmin(jwt, studentId);
        return studentService.progress(studentId);
    }

    @GetMapping("/announcements")
    public List<AnnouncementDto> announcements(@AuthenticationPrincipal Jwt jwt, @PathVariable String studentId) {
        AccessGuard.requireSelfOrAdmin(jwt, studentId);
        return studentService.announcements(studentId);
    }

    @GetMapping("/profile")
    public StudentDtos.Profile profile(@AuthenticationPrincipal Jwt jwt, @PathVariable String studentId) {
        AccessGuard.requireSelfOrAdmin(jwt, studentId);
        return studentService.profile(studentId);
    }

    @PatchMapping("/profile")
    public StudentDto updateProfile(@AuthenticationPrincipal Jwt jwt, @PathVariable String studentId,
                                    @RequestBody StudentDtos.ProfileUpdateRequest request) {
        AccessGuard.requireSelfOrAdmin(jwt, studentId);
        return studentService.updateProfile(studentId, request);
    }

    /** Only the student themself can change their password. */
    @PostMapping("/change-password")
    public StudentDtos.ChangePasswordResponse changePassword(@AuthenticationPrincipal Jwt jwt,
                                                             @PathVariable String studentId,
                                                             @RequestBody StudentDtos.ChangePasswordRequest request) {
        if (!jwt.getSubject().equals(studentId)) {
            throw ApiException.forbidden("You can only change your own password.");
        }
        return studentService.changePassword(studentId, request);
    }
}
