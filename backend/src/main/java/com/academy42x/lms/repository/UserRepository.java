package com.academy42x.lms.repository;

import com.academy42x.lms.entity.User;
import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.JpaRepository;

public interface UserRepository extends JpaRepository<User, String> {

    Optional<User> findByEmailIgnoreCase(String email);

    List<User> findByRoleOrderByNameAsc(String role);

    List<User> findByPasswordHashIsNull();

    long countByRole(String role);

    long countByRoleAndStatus(String role, String status);
}
