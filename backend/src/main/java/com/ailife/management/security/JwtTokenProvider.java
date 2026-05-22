package com.ailife.management.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.nio.charset.StandardCharsets;
import java.security.Key;
import java.security.MessageDigest;
import java.time.Instant;
import java.util.Date;

@Component
public class JwtTokenProvider {
    private final Key key;
    private final long expirationMinutes;

    public JwtTokenProvider(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.expiration-minutes}") long expirationMinutes) {
        this.key = Keys.hmacShaKeyFor(resolveKeyBytes(secret));
        this.expirationMinutes = expirationMinutes;
    }

    public String createToken(UserPrincipal principal) {
        Instant now = Instant.now();
        Instant expires = now.plusSeconds(expirationMinutes * 60);
        return Jwts.builder()
                .setSubject(String.valueOf(principal.getId()))
                .claim("tenantId", principal.getTenantId())
                .claim("email", principal.getEmail())
                .claim("role", principal.getAuthorities().iterator().next().getAuthority())
                .setIssuedAt(Date.from(now))
                .setExpiration(Date.from(expires))
                .signWith(key, SignatureAlgorithm.HS256)
                .compact();
    }

    public Long getUserId(String token) {
        return Long.valueOf(parseClaims(token).getSubject());
    }

    public Long getTenantId(String token) {
        Object tenantId = parseClaims(token).get("tenantId");
        if (tenantId instanceof Number) {
            return ((Number) tenantId).longValue();
        }
        return Long.valueOf(String.valueOf(tenantId));
    }

    public boolean validate(String token) {
        parseClaims(token);
        return true;
    }

    private Claims parseClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(key)
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    private byte[] resolveKeyBytes(String secret) {
        byte[] keyBytes;
        try {
            keyBytes = Decoders.BASE64.decode(secret);
        } catch (RuntimeException ex) {
            keyBytes = secret.getBytes(StandardCharsets.UTF_8);
        }
        if (keyBytes.length < 32) {
            try {
                return MessageDigest.getInstance("SHA-256").digest(keyBytes);
            } catch (Exception ex) {
                throw new IllegalStateException("Unable to create JWT signing key", ex);
            }
        }
        return keyBytes;
    }
}
