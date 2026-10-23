package com.academy42x.lms.dto;

import com.academy42x.lms.entity.User;
import java.time.LocalDate;
import java.time.LocalDateTime;

/** createdAt = exact date and time the admin added the student (helps tell apart students with the same name). */
public record StudentDto(String id, String name, String email, String phone, String batch, String city,
                         String status, LocalDate joinedOn, LocalDateTime createdAt) {

    public static StudentDto from(User user) {
        return new StudentDto(user.getId(), user.getName(), user.getEmail(), user.getPhone(), user.getBatch(),
                user.getCity(), user.getStatus(), user.getJoinedOn(), user.getCreatedAt());
    }
}
