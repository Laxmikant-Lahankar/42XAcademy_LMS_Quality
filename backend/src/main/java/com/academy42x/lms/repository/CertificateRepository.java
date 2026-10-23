package com.academy42x.lms.repository;

import com.academy42x.lms.entity.Certificate;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CertificateRepository extends JpaRepository<Certificate, String> {

    List<Certificate> findByStudentId(String studentId);

    Optional<Certificate> findByStudentIdAndCourseId(String studentId, String courseId);
}
