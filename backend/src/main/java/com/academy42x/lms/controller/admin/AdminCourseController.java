package com.academy42x.lms.controller.admin;

import com.academy42x.lms.dto.CourseDto;
import com.academy42x.lms.dto.EnrollmentRowDto;
import com.academy42x.lms.dto.LectureDto;
import com.academy42x.lms.dto.ModuleDto;
import com.academy42x.lms.dto.ResourceDto;
import com.academy42x.lms.dto.ResourceViewDto;
import com.academy42x.lms.dto.StudentDto;
import com.academy42x.lms.dto.admin.AdminDtos;
import com.academy42x.lms.service.admin.AdminContentService;
import com.academy42x.lms.service.admin.AdminCourseService;
import java.util.List;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

/**
 * /api/admin/courses — courses and everything inside ONE course:
 * students, modules, lectures and resources.
 */
@RestController
@RequestMapping("/admin/courses")
public class AdminCourseController {

    private final AdminCourseService courseService;
    private final AdminContentService contentService;

    public AdminCourseController(AdminCourseService courseService, AdminContentService contentService) {
        this.courseService = courseService;
        this.contentService = contentService;
    }

    // ---------- Courses ----------

    @GetMapping
    public List<AdminDtos.CourseRow> courses() {
        return courseService.courses();
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public CourseDto create(@RequestBody AdminDtos.CourseRequest request) {
        return courseService.create(request);
    }

    @GetMapping("/{courseId}")
    public AdminDtos.CourseRow course(@PathVariable String courseId) {
        return courseService.course(courseId);
    }

    @PutMapping("/{courseId}")
    public CourseDto update(@PathVariable String courseId, @RequestBody AdminDtos.CourseRequest request) {
        return courseService.update(courseId, request);
    }

    /** Publish / move to draft. */
    @PatchMapping("/{courseId}")
    public CourseDto setStatus(@PathVariable String courseId, @RequestBody AdminDtos.StatusRequest request) {
        return courseService.setStatus(courseId, request.status());
    }

    @DeleteMapping("/{courseId}")
    public ResponseEntity<Void> delete(@PathVariable String courseId) {
        courseService.delete(courseId);
        return ResponseEntity.noContent().build();
    }

    // ---------- Course → Students ----------

    @GetMapping("/{courseId}/students")
    public List<EnrollmentRowDto> students(@PathVariable String courseId) {
        return courseService.courseStudents(courseId);
    }

    @GetMapping("/{courseId}/available-students")
    public List<StudentDto> availableStudents(@PathVariable String courseId) {
        return courseService.availableStudents(courseId);
    }

    // ---------- Course → Modules ----------

    @GetMapping("/{courseId}/modules")
    public List<AdminDtos.ModuleRow> modules(@PathVariable String courseId) {
        return contentService.modules(courseId);
    }

    @PostMapping("/{courseId}/modules")
    @ResponseStatus(HttpStatus.CREATED)
    public ModuleDto createModule(@PathVariable String courseId, @RequestBody AdminDtos.ModuleRequest request) {
        return contentService.createModule(courseId, request);
    }

    @PutMapping("/{courseId}/modules/{moduleId}")
    public ModuleDto updateModule(@PathVariable String courseId, @PathVariable String moduleId,
                                  @RequestBody AdminDtos.ModuleRequest request) {
        return contentService.updateModule(courseId, moduleId, request);
    }

    @PostMapping("/{courseId}/modules/{moduleId}/move")
    public ResponseEntity<Void> moveModule(@PathVariable String courseId, @PathVariable String moduleId,
                                           @RequestBody AdminDtos.MoveRequest request) {
        contentService.moveModule(courseId, moduleId, request.direction() == null ? 0 : request.direction());
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{courseId}/modules/{moduleId}")
    public ResponseEntity<Void> deleteModule(@PathVariable String courseId, @PathVariable String moduleId) {
        contentService.deleteModule(courseId, moduleId);
        return ResponseEntity.noContent().build();
    }

    // ---------- Course → Lectures ----------

    @GetMapping("/{courseId}/lectures")
    public List<LectureDto> lectures(@PathVariable String courseId) {
        return contentService.lectures(courseId);
    }

    @PostMapping("/{courseId}/lectures")
    @ResponseStatus(HttpStatus.CREATED)
    public LectureDto createLecture(@PathVariable String courseId, @RequestBody AdminDtos.LectureRequest request) {
        return contentService.createLecture(courseId, request);
    }

    @PutMapping("/{courseId}/lectures/{lectureId}")
    public LectureDto updateLecture(@PathVariable String courseId, @PathVariable String lectureId,
                                    @RequestBody AdminDtos.LectureRequest request) {
        return contentService.updateLecture(courseId, lectureId, request);
    }

    @DeleteMapping("/{courseId}/lectures/{lectureId}")
    public ResponseEntity<Void> deleteLecture(@PathVariable String courseId, @PathVariable String lectureId) {
        contentService.deleteLecture(courseId, lectureId);
        return ResponseEntity.noContent().build();
    }

    // ---------- Course → Resources ----------

    @GetMapping("/{courseId}/resources")
    public List<ResourceViewDto> resources(@PathVariable String courseId) {
        return contentService.resources(courseId);
    }

    @PostMapping("/{courseId}/resources")
    @ResponseStatus(HttpStatus.CREATED)
    public ResourceDto createResource(@PathVariable String courseId, @RequestBody AdminDtos.ResourceRequest request) {
        return contentService.createResource(courseId, request);
    }

    @PutMapping("/{courseId}/resources/{resourceId}")
    public ResourceDto updateResource(@PathVariable String courseId, @PathVariable String resourceId,
                                      @RequestBody AdminDtos.ResourceRequest request) {
        return contentService.updateResource(courseId, resourceId, request);
    }

    @DeleteMapping("/{courseId}/resources/{resourceId}")
    public ResponseEntity<Void> deleteResource(@PathVariable String courseId, @PathVariable String resourceId) {
        contentService.deleteResource(courseId, resourceId);
        return ResponseEntity.noContent().build();
    }
}
