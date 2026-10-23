package com.academy42x.lms.repository;

import com.academy42x.lms.entity.LearningResource;
import java.util.Collection;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface LearningResourceRepository extends JpaRepository<LearningResource, String> {

    List<LearningResource> findByCourseIdOrderByUpdatedOnDesc(String courseId);

    List<LearningResource> findByCourseIdIn(Collection<String> courseIds);

    List<LearningResource> findByModuleId(String moduleId);

    long countByCourseId(String courseId);

    @Modifying
    @Query("update LearningResource r set r.lectureId = null where r.lectureId = :lectureId")
    void unlinkLecture(@Param("lectureId") String lectureId);

    @Modifying
    @Query("update LearningResource r set r.lectureId = null"
            + " where r.lectureId in (select l.id from Lecture l where l.moduleId = :moduleId)")
    void unlinkLecturesOfModule(@Param("moduleId") String moduleId);

    @Modifying
    @Query("update LearningResource r set r.moduleId = null where r.moduleId = :moduleId")
    void unlinkModule(@Param("moduleId") String moduleId);
}
