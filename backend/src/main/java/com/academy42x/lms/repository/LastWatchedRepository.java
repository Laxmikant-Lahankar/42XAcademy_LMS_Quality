package com.academy42x.lms.repository;

import com.academy42x.lms.entity.LastWatched;
import org.springframework.data.jpa.repository.JpaRepository;

public interface LastWatchedRepository extends JpaRepository<LastWatched, String> {
}
