
package com.sajib.deshibazar.auth.service;

import com.sajib.deshibazar.auth.dto.LoginRequest;
import com.sajib.deshibazar.auth.dto.LoginResponse;
import com.sajib.deshibazar.auth.dto.RefreshRequest;
import com.sajib.deshibazar.auth.dto.RefreshResponse;
import com.sajib.deshibazar.auth.dto.RegisterRequest;
import com.sajib.deshibazar.auth.entity.RefreshToken;
import com.sajib.deshibazar.common.exception.EmailAlreadyExistsException;
import com.sajib.deshibazar.common.exception.InvalidCredentialsException;
import com.sajib.deshibazar.user.entity.User;
import com.sajib.deshibazar.user.entity.UserRole;
import com.sajib.deshibazar.user.service.UserService;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserService userService;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final RefreshTokenService refreshTokenService;

    public AuthService(
            UserService userService,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            RefreshTokenService refreshTokenService
    ) {
        this.userService = userService;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.refreshTokenService = refreshTokenService;
    }

    public void register(RegisterRequest request) {

        if (userService.findByEmail(request.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException(
                    "Email already registered"
            );
        }

        User user = new User();

        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setRole(UserRole.CUSTOMER);

        userService.save(user);
    }

    public LoginResponse login(LoginRequest request) {

        User user = userService.findByEmail(request.getEmail())
                .orElseThrow(() ->
                        new InvalidCredentialsException(
                                "Invalid email or password"
                        )
                );

        boolean passwordMatches = passwordEncoder.matches(
                request.getPassword(),
                user.getPassword()
        );

        if (!passwordMatches) {
            throw new InvalidCredentialsException(
                    "Invalid email or password"
            );
        }

        String accessToken =
                jwtService.generateAccessToken(user);

        RefreshToken refreshToken =
                refreshTokenService.createRefreshToken(user);

        return new LoginResponse(
                accessToken,
                refreshToken.getToken(),
                "Bearer"
        );
    }

    public RefreshResponse refresh(RefreshRequest request) {

        RefreshToken oldRefreshToken =
                refreshTokenService.verifyRefreshToken(
                        request.getRefreshToken()
                );

        User user = oldRefreshToken.getUser();

        String newAccessToken =
                jwtService.generateAccessToken(user);

        RefreshToken newRefreshToken =
                refreshTokenService.createRefreshToken(user);

        return new RefreshResponse(
                newAccessToken,
                newRefreshToken.getToken(),
                "Bearer"
        );
    }
}
