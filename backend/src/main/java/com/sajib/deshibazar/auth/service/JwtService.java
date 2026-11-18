package com.sajib.deshibazar.auth.service;

import com.sajib.deshibazar.user.entity.User;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.util.Date;

@Service
public class JwtService {

    private static final long ACCESS_TOKEN_EXPIRATION = 24 * 60 * 60 * 1000;
    private static final long REFRESH_TOKEN_EXPIRATION = 48 * 60 * 60 * 1000;

    private final SecretKey secretKey;

    public JwtService(@Value("${jwt.secret}") String secret) {
        byte[] keyBytes = Decoders.BASE64.decode(secret);
        this.secretKey = Keys.hmacShaKeyFor(keyBytes);
    }

    public String generateAccessToken(User user) {
        return generateToken(user, ACCESS_TOKEN_EXPIRATION, "ACCESS");
    }

    public String generateRefreshToken(User user) {
        return generateToken(user, REFRESH_TOKEN_EXPIRATION, "REFRESH");
    }

    private String generateToken(
            User user,
            long expiration,
            String tokenType
    ) {
        Date issuedAt = new Date();
        Date expirationDate = new Date(
                issuedAt.getTime() + expiration
        );

        return Jwts.builder()
                .subject(user.getEmail())
                .claim("role", user.getRole().name())
                .claim("tokenType", tokenType)
                .issuedAt(issuedAt)
                .expiration(expirationDate)
                .signWith(secretKey)
                .compact();
    }

    public String extractEmail(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getSubject();
    }

    public boolean isTokenValid(String token, User user) {
        try {
            String email = extractEmail(token);

            return email.equals(user.getEmail())
                    && !isTokenExpired(token);

        } catch (Exception exception) {
            return false;
        }
    }

    private boolean isTokenExpired(String token) {
        Date expiration = Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload()
                .getExpiration();

        return expiration.before(new Date());
    }
}