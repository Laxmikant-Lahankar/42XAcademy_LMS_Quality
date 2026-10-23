package com.academy42x.lms.repository;

import com.academy42x.lms.entity.Course;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CourseRepository extends JpaRepository<Course, String> {

    List<Course> findAllByOrderByTitleAsc();

    boolean existsByCodeIgnoreCase(String code);

    long countByStatus(String status);
}
