package com.academy42x.lms.repository;

import com.academy42x.lms.entity.LectureProgress;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LectureProgressRepository extends JpaRepository<LectureProgress, LectureProgress.Key> {

    List<LectureProgress> findByStudentId(String studentId);

    List<LectureProgress> findByStudentIdIn(Collection<String> studentIds);
}
