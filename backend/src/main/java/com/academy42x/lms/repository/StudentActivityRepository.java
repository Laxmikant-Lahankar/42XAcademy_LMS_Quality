package com.academy42x.lms.repository;

import com.academy42x.lms.entity.StudentActivity;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface StudentActivityRepository extends JpaRepository<StudentActivity, Long> {

    List<StudentActivity> findTop5ByStudentIdOrderByCreatedAtDescIdDesc(String studentId);
}
