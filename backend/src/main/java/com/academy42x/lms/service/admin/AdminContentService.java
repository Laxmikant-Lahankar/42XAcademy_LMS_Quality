package com.academy42x.lms.service.admin;

import com.academy42x.lms.dto.LectureDto;
import com.academy42x.lms.dto.ModuleDto;
import com.academy42x.lms.dto.ResourceDto;
import com.academy42x.lms.dto.ResourceViewDto;
import com.academy42x.lms.dto.admin.AdminDtos;
import com.academy42x.lms.entity.CourseModule;
import com.academy42x.lms.entity.LearningResource;
import com.academy42x.lms.entity.Lecture;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.repository.CourseModuleRepository;
import com.academy42x.lms.repository.LearningResourceRepository;
import com.academy42x.lms.repository.LectureRepository;
import com.academy42x.lms.util.SequentialIds;
import com.academy42x.lms.util.Inputs;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Course content: modules, lectures and resources. Every method is scoped to ONE course,
 * so content can never be attached to another course by mistake.
 */
@Service
@Transactional(readOnly = true)
public class AdminContentService {

    public static final List<String> RESOURCE_TYPES = List.of("Syllabus", "Notes", "PDF", "Assignment", "Dataset", "Slides");

    private final CourseModuleRepository modules;
    private final LectureRepository lectures;
    private final LearningResourceRepository resources;
    private final AdminSupport support;
    private final SequentialIds ids;

    public AdminContentService(CourseModuleRepository modules, LectureRepository lectures,
                               LearningResourceRepository resources, AdminSupport support, SequentialIds ids) {
        this.modules = modules;
        this.lectures = lectures;
        this.resources = resources;
        this.support = support;
        this.ids = ids;
    }

    // ---------------------------------------------------------------------------------------------
    // Modules
    // ---------------------------------------------------------------------------------------------

    public List<AdminDtos.ModuleRow> modules(String courseId) {
        support.requireCourse(courseId);
        return modules.findByCourseIdOrderBySortOrderAsc(courseId).stream()
                .map(m -> new AdminDtos.ModuleRow(ModuleDto.from(m), lectures.countByModuleId(m.getId())))
                .toList();
    }

    @Transactional
    public ModuleDto createModule(String courseId, AdminDtos.ModuleRequest request) {
        support.requireCourse(courseId);
        int count = (int) modules.countByCourseId(courseId);

        CourseModule module = new CourseModule();
        module.setId(ids.module(courseId));
        module.setCourseId(courseId);
        module.setTitle(Inputs.requireText(request.title(), "Title"));
        module.setSortOrder(Inputs.toInt(request.order(), count + 1));
        return ModuleDto.from(modules.save(module));
    }

    @Transactional
    public ModuleDto updateModule(String courseId, String moduleId, AdminDtos.ModuleRequest request) {
        CourseModule module = requireModule(courseId, moduleId);
        module.setTitle(Inputs.requireText(request.title(), "Title"));
        return ModuleDto.from(modules.save(module));
    }

    /** Swaps a module with its neighbour (direction -1 = up, +1 = down) and renumbers 1..n. */
    @Transactional
    public void moveModule(String courseId, String moduleId, int direction) {
        requireModule(courseId, moduleId);
        List<CourseModule> ordered = new ArrayList<>(modules.findByCourseIdOrderBySortOrderAsc(courseId));
        int index = indexOf(ordered, moduleId);
        int target = index + (direction < 0 ? -1 : 1);
        if (target < 0 || target >= ordered.size()) {
            return;
        }
        CourseModule moving = ordered.get(index);
        ordered.set(index, ordered.get(target));
        ordered.set(target, moving);
        renumber(ordered);
    }

    /** Lectures are deleted with the module (cascade); its resources stay on the course, unlinked first. */
    @Transactional
    public void deleteModule(String courseId, String moduleId) {
        CourseModule module = requireModule(courseId, moduleId);
        resources.unlinkLecturesOfModule(moduleId);
        resources.unlinkModule(moduleId);
        modules.delete(module);
        modules.flush();
        renumber(modules.findByCourseIdOrderBySortOrderAsc(courseId));
    }

    private void renumber(List<CourseModule> ordered) {
        for (int i = 0; i < ordered.size(); i++) {
            ordered.get(i).setSortOrder(i + 1);
        }
        modules.saveAll(ordered);
    }

    private CourseModule requireModule(String courseId, String moduleId) {
        return modules.findById(moduleId)
                .filter(m -> m.getCourseId().equals(courseId))
                .orElseThrow(() -> ApiException.notFound("This module could not be found in this course."));
    }

    // ---------------------------------------------------------------------------------------------
    // Lectures
    // ---------------------------------------------------------------------------------------------

    public List<LectureDto> lectures(String courseId) {
        support.requireCourse(courseId);
        return lectures.findByCourseId(courseId).stream()
                .sorted(Comparator.comparingInt(Lecture::getSortOrder))
                .map(LectureDto::from)
                .toList();
    }

    @Transactional
    public LectureDto createLecture(String courseId, AdminDtos.LectureRequest request) {
        support.requireCourse(courseId);
        Lecture lecture = new Lecture();
        lecture.setCourseId(courseId);
        apply(courseId, lecture, request, true);
        lecture.setId(ids.lecture(lecture.getModuleId()));   // e.g. sap-abap-m2-l4
        return LectureDto.from(lectures.save(lecture));
    }

    @Transactional
    public LectureDto updateLecture(String courseId, String lectureId, AdminDtos.LectureRequest request) {
        Lecture lecture = requireLecture(courseId, lectureId);
        apply(courseId, lecture, request, false);
        return LectureDto.from(lectures.save(lecture));
    }

    private void apply(String courseId, Lecture lecture, AdminDtos.LectureRequest request, boolean isNew) {
        String moduleId = Inputs.requireText(request.moduleId(), "Module");
        CourseModule module = modules.findById(moduleId)
                .filter(m -> m.getCourseId().equals(courseId))
                .orElseThrow(() -> ApiException.badRequest("Choose a module from this course."));

        boolean moduleChanged = !module.getId().equals(lecture.getModuleId());
        int defaultOrder = isNew || moduleChanged
                ? lectures.findByModuleIdOrderBySortOrderAsc(module.getId()).size() + 1
                : lecture.getSortOrder();

        lecture.setModuleId(module.getId());
        lecture.setTitle(Inputs.requireText(request.title(), "Title"));
        lecture.setDescription(Inputs.text(request.description()));
        lecture.setSortOrder(Inputs.toInt(request.order(), defaultOrder));
        lecture.setDurationMinutes(Inputs.toInt(request.durationMinutes(), 0));
        lecture.setVideoUrl(Inputs.nullIfBlank(request.videoUrl()));
        lecture.setOneDriveItemId(Inputs.nullIfBlank(request.oneDriveItemId()));
    }

    /** Resources linked to this lecture stay on the course, unlinked first. */
    @Transactional
    public void deleteLecture(String courseId, String lectureId) {
        Lecture lecture = requireLecture(courseId, lectureId);
        resources.unlinkLecture(lectureId);
        lectures.delete(lecture);
    }

    private Lecture requireLecture(String courseId, String lectureId) {
        return lectures.findById(lectureId)
                .filter(l -> l.getCourseId().equals(courseId))
                .orElseThrow(() -> ApiException.notFound("This lecture could not be found in this course."));
    }

    // ---------------------------------------------------------------------------------------------
    // Resources
    // ---------------------------------------------------------------------------------------------

    public List<ResourceViewDto> resources(String courseId) {
        support.requireCourse(courseId);
        Map<String, String> moduleTitles = modules.findByCourseIdOrderBySortOrderAsc(courseId).stream()
                .collect(Collectors.toMap(CourseModule::getId, CourseModule::getTitle));
        Map<String, String> lectureTitles = lectures.findByCourseId(courseId).stream()
                .collect(Collectors.toMap(Lecture::getId, Lecture::getTitle));

        return resources.findByCourseIdOrderByUpdatedOnDesc(courseId).stream()
                .map(r -> new ResourceViewDto(ResourceDto.from(r), null,
                        r.getModuleId() == null ? null : moduleTitles.get(r.getModuleId()),
                        r.getLectureId() == null ? null : lectureTitles.get(r.getLectureId())))
                .toList();
    }

    @Transactional
    public ResourceDto createResource(String courseId, AdminDtos.ResourceRequest request) {
        support.requireCourse(courseId);
        LearningResource resource = new LearningResource();
        resource.setId(ids.resource());
        resource.setCourseId(courseId);
        apply(courseId, resource, request);
        return ResourceDto.from(resources.save(resource));
    }

    @Transactional
    public ResourceDto updateResource(String courseId, String resourceId, AdminDtos.ResourceRequest request) {
        LearningResource resource = requireResource(courseId, resourceId);
        apply(courseId, resource, request);
        return ResourceDto.from(resources.save(resource));
    }

    private void apply(String courseId, LearningResource resource, AdminDtos.ResourceRequest request) {
        String moduleId = Inputs.nullIfBlank(request.moduleId());
        String lectureId = Inputs.nullIfBlank(request.lectureId());

        if (moduleId != null) {
            modules.findById(moduleId)
                    .filter(m -> m.getCourseId().equals(courseId))
                    .orElseThrow(() -> ApiException.badRequest("Choose a module from this course."));
        }
        if (lectureId != null) {
            Lecture lecture = lectures.findById(lectureId)
                    .filter(l -> l.getCourseId().equals(courseId))
                    .orElseThrow(() -> ApiException.badRequest("Choose a lecture from this course."));
            if (moduleId != null && !lecture.getModuleId().equals(moduleId)) {
                throw ApiException.badRequest("Choose a lecture from the selected module.");
            }
            moduleId = lecture.getModuleId();
        }

        resource.setTitle(Inputs.requireText(request.title(), "Title"));
        resource.setDescription(Inputs.text(request.description()));
        resource.setType(Inputs.oneOf(request.type(), "Notes", RESOURCE_TYPES.toArray(String[]::new)));
        resource.setModuleId(moduleId);
        resource.setLectureId(lectureId);
        resource.setSizeKb(Inputs.toInt(request.sizeKb(), 0));
        resource.setFileUrl(Inputs.nullIfBlank(request.fileUrl()));
        resource.setUpdatedOn(LocalDate.now());
    }

    @Transactional
    public void deleteResource(String courseId, String resourceId) {
        resources.delete(requireResource(courseId, resourceId));
    }

    private LearningResource requireResource(String courseId, String resourceId) {
        return resources.findById(resourceId)
                .filter(r -> r.getCourseId().equals(courseId))
                .orElseThrow(() -> ApiException.notFound("This resource could not be found in this course."));
    }

    private static int indexOf(List<CourseModule> ordered, String moduleId) {
        for (int i = 0; i < ordered.size(); i++) {
            if (ordered.get(i).getId().equals(moduleId)) {
                return i;
            }
        }
        return -1;
    }
}
