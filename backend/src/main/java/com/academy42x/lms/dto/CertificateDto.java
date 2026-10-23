package com.academy42x.lms.dto;

import com.academy42x.lms.entity.Certificate;
import java.time.LocalDate;

public record CertificateDto(String id, String studentId, String courseId, String status, String certificateNo,
                             LocalDate issuedOn) {

    public static CertificateDto from(Certificate certificate) {
        return certificate == null ? null : new CertificateDto(certificate.getId(), certificate.getStudentId(),
                certificate.getCourseId(), certificate.getStatus(), certificate.getCertificateNo(),
                certificate.getIssuedOn());
    }
}
