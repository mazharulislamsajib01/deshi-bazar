
package com.sajib.deshibazar.auth.service;

import com.sajib.deshibazar.auth.entity.RefreshToken;
import com.sajib.deshibazar.auth.repository.RefreshTokenRepository;
import com.sajib.deshibazar.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
public class RefreshTokenService {

    private static final long REFRESH_TOKEN_EXPIRATION_DAYS = 1;

    private final RefreshTokenRepository refreshTokenRepository;

    public RefreshTokenService(
            RefreshTokenRepository refreshTokenRepository
    ) {
        this.refreshTokenRepository = refreshTokenRepository;
    }

    @Transactional
    public RefreshToken createRefreshToken(User user) {

        // Delete the user's previous refresh token
        refreshTokenRepository.deleteByUserId(user.getId());

        // Execute the deletion immediately in the database
        refreshTokenRepository.flush();

        // Create a new refresh token
        RefreshToken refreshToken = new RefreshToken();

        refreshToken.setToken(UUID.randomUUID().toString());
        refreshToken.setUser(user);
        refreshToken.setExpiryDate(
                LocalDateTime.now().plusDays(
                        REFRESH_TOKEN_EXPIRATION_DAYS
                )
        );

        return refreshTokenRepository.save(refreshToken);
    }

    public RefreshToken verifyRefreshToken(String token) {

        RefreshToken refreshToken = refreshTokenRepository
                .findByToken(token)
                .orElseThrow(() ->
                        new IllegalArgumentException(
                                "Refresh token not found"
                        )
                );

        if (refreshToken.getExpiryDate().isBefore(LocalDateTime.now())) {

            refreshTokenRepository.delete(refreshToken);

            throw new IllegalArgumentException(
                    "Refresh token expired"
            );
        }

        return refreshToken;
    }

    public void deleteByUserId(Long userId) {
        refreshTokenRepository.deleteByUserId(userId);
    }
}
