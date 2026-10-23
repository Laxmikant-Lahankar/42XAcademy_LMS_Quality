package com.academy42x.lms.repository;

import com.academy42x.lms.entity.Enrollment;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface EnrollmentRepository extends JpaRepository<Enrollment, String> {

    List<Enrollment> findByStudentId(String studentId);

    List<Enrollment> findByCourseId(String courseId);

    Optional<Enrollment> findByStudentIdAndCourseId(String studentId, String courseId);

    boolean existsByCourseId(String courseId);

    long countByCourseId(String courseId);
}
