package com.academy42x.lms.repository;

import com.academy42x.lms.entity.CourseModule;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseModuleRepository extends JpaRepository<CourseModule, String> {

    List<CourseModule> findByCourseIdOrderBySortOrderAsc(String courseId);

    List<CourseModule> findByCourseIdIn(Collection<String> courseIds);

    long countByCourseId(String courseId);
}
