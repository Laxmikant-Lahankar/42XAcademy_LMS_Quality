package com.academy42x.lms.repository;

import com.academy42x.lms.entity.Lecture;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureRepository extends JpaRepository<Lecture, String> {

    List<Lecture> findByCourseId(String courseId);

    List<Lecture> findByCourseIdIn(Collection<String> courseIds);

    List<Lecture> findByModuleIdOrderBySortOrderAsc(String moduleId);

    long countByCourseId(String courseId);

    long countByModuleId(String moduleId);
}
