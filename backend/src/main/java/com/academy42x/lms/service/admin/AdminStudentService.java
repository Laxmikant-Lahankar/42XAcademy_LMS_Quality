package com.academy42x.lms.service.admin;

import com.academy42x.lms.dto.EnrollmentRowDto;
import com.academy42x.lms.dto.StudentDto;
import com.academy42x.lms.dto.admin.AdminDtos;
import com.academy42x.lms.entity.User;
import com.academy42x.lms.exception.ApiException;
import com.academy42x.lms.repository.EnrollmentRepository;
import com.academy42x.lms.repository.UserRepository;
import com.academy42x.lms.util.SequentialIds;
import com.academy42x.lms.util.Inputs;
import java.time.LocalDate;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.stream.Collectors;
import com.academy42x.lms.security.PasswordWriter;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Academy-wide student management.
 * The student's email is their login username; the admin sets the password when adding a student
 * and can reset it later.
 */
@Service
@Transactional(readOnly = true)
public class AdminStudentService {

    public static final int MIN_PASSWORD_LENGTH = 8;

    private final UserRepository users;
    private final EnrollmentRepository enrollments;
    private final AdminSupport support;
    private final PasswordWriter passwords;
    private final SequentialIds ids;

    public AdminStudentService(UserRepository users, EnrollmentRepository enrollments, AdminSupport support,
                               PasswordWriter passwords, SequentialIds ids) {
        this.users = users;
        this.enrollments = enrollments;
        this.support = support;
        this.passwords = passwords;
        this.ids = ids;
    }

    public List<AdminDtos.StudentRow> students() {
        Map<String, List<EnrollmentRowDto>> rowsByStudent = support.enrollmentRows(enrollments.findAll()).stream()
                .collect(Collectors.groupingBy(row -> row.enrollment().studentId()));

        return users.findByRoleOrderByNameAsc(User.ROLE_STUDENT).stream()
                .map(student -> {
                    List<EnrollmentRowDto> own = rowsByStudent.getOrDefault(student.getId(), List.of());
                    int average = own.isEmpty() ? 0
                            : Math.round((float) own.stream().mapToInt(r -> r.progress().percent()).sum() / own.size());
                    return new AdminDtos.StudentRow(StudentDto.from(student),
                            own.stream().map(r -> r.enrollment().courseId()).toList(),
                            own.stream().map(EnrollmentRowDto::courseTitle).toList(),
                            average);
                })
                .toList();
    }

    public AdminDtos.StudentDetails details(String studentId) {
        User student = support.requireStudent(studentId);
        return new AdminDtos.StudentDetails(StudentDto.from(student),
                support.enrollmentRows(enrollments.findByStudentId(studentId)),
                new AdminDtos.LoginDetails(student.getEmail(), passwords.readableCopy(student)));
    }

    @Transactional
    public StudentDto create(AdminDtos.StudentRequest request) {
        String password = request.password() == null ? "" : request.password();
        if (password.isBlank()) {
            throw ApiException.badRequest("Password is required so the student can sign in.");
        }

        User student = new User();
        student.setId(ids.student());
        student.setRole(User.ROLE_STUDENT);
        student.setJoinedOn(LocalDate.now());
        apply(student, request);
        setPassword(student, password);
        return StudentDto.from(users.save(student));
    }

    /** An empty password keeps the current one; a new password resets it. */
    @Transactional
    public StudentDto update(String studentId, AdminDtos.StudentRequest request) {
        User student = support.requireStudent(studentId);
        apply(student, request);
        if (request.password() != null && !request.password().isBlank()) {
            setPassword(student, request.password());
        }
        return StudentDto.from(users.save(student));
    }

    /**
     * Permanently deletes the student. Their enrollments, progress, activity and certificates
     * are removed by the database (ON DELETE CASCADE). Use "Deactivate" to keep the history.
     */
    @Transactional
    public void delete(String studentId) {
        users.delete(support.requireStudent(studentId));
    }

    private void apply(User student, AdminDtos.StudentRequest request) {
        String name = Inputs.requireText(request.name(), "Name");
        String email = Inputs.requireText(request.email(), "Email").toLowerCase(Locale.ROOT);
        if (!email.matches("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$")) {
            throw ApiException.badRequest("Enter a valid email address.");
        }
        users.findByEmailIgnoreCase(email)
                .filter(other -> !other.getId().equals(student.getId()))
                .ifPresent(other -> {
                    throw ApiException.conflict("Another account already uses this email.");
                });

        student.setName(name);
        student.setEmail(email);
        student.setPhone(Inputs.text(request.phone()));
        student.setCity(Inputs.text(request.city()));
        student.setBatch(Inputs.text(request.batch()));
        student.setStatus(Inputs.oneOf(request.status(), User.STATUS_ACTIVE, User.STATUS_ACTIVE, User.STATUS_INACTIVE));
    }

    private void setPassword(User student, String password) {
        if (password.length() < MIN_PASSWORD_LENGTH) {
            throw ApiException.badRequest("The password must be at least " + MIN_PASSWORD_LENGTH + " characters.");
        }
        passwords.setPassword(student, password);
    }
}
