package com.academy42x.lms.repository;

import com.academy42x.lms.entity.Announcement;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AnnouncementRepository extends JpaRepository<Announcement, String> {

    List<Announcement> findAllByOrderByPinnedDescPostedOnDesc();
}
