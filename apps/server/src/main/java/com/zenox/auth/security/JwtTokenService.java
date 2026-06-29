package com.zenox.auth.security;

import com.zenox.common.config.JwtProperties;
import com.zenox.common.enums.UserRole;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;
import javax.crypto.SecretKey;
import org.springframework.stereotype.Service;

@Service
public class JwtTokenService {
  private final JwtProperties jwtProperties;
  private final SecretKey key;

  public JwtTokenService(JwtProperties jwtProperties) {
    this.jwtProperties = jwtProperties;
    this.key = Keys.hmacShaKeyFor(jwtProperties.secret().getBytes(StandardCharsets.UTF_8));
  }

  public String createAccessToken(Long userId, Long tenantId, String username, UserRole role) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("tenantId", String.valueOf(tenantId))
        .claim("username", username)
        .claim("role", role.name())
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(jwtProperties.accessTokenTtlMinutes(), ChronoUnit.MINUTES)))
        .signWith(key)
        .compact();
  }

  public String createRefreshToken(Long userId) {
    Instant now = Instant.now();
    return Jwts.builder()
        .subject(String.valueOf(userId))
        .claim("type", "refresh")
        .issuedAt(Date.from(now))
        .expiration(Date.from(now.plus(jwtProperties.refreshTokenTtlDays(), ChronoUnit.DAYS)))
        .signWith(key)
        .compact();
  }

  public Claims parse(String token) {
    return Jwts.parser()
        .verifyWith(key)
        .build()
        .parseSignedClaims(token)
        .getPayload();
  }
}
