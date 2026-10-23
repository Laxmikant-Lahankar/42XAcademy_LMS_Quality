package com.academy42x.lms.security;

import com.academy42x.lms.config.AppProperties;
import com.academy42x.lms.entity.User;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.stereotype.Service;

/** Issues signed login tokens (JWT, HS256). Subject = user id, plus role / name / email claims. */
@Service
public class JwtService {

    private final JwtEncoder encoder;
    private final AppProperties properties;

    public JwtService(JwtEncoder encoder, AppProperties properties) {
        this.encoder = encoder;
        this.properties = properties;
    }

    public String createToken(User user) {
        Instant now = Instant.now();
        long minutes = properties.jwt().expirationMinutes() > 0 ? properties.jwt().expirationMinutes() : 480;

        JwtClaimsSet claims = JwtClaimsSet.builder()
                .issuer(properties.jwt().issuer() == null ? "42x-lms" : properties.jwt().issuer())
                .issuedAt(now)
                .expiresAt(now.plus(minutes, ChronoUnit.MINUTES))
                .subject(user.getId())
                .claim("role", user.getRole())
                .claim("name", user.getName())
                .claim("email", user.getEmail())
                .build();

        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
