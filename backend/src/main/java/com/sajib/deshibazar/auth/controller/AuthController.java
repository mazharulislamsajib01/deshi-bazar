
package com.sajib.deshibazar.auth.controller;

import com.sajib.deshibazar.auth.dto.LoginRequest;
import com.sajib.deshibazar.auth.dto.LoginResponse;
import com.sajib.deshibazar.auth.dto.RefreshRequest;
import com.sajib.deshibazar.auth.dto.RefreshResponse;
import com.sajib.deshibazar.auth.dto.RegisterRequest;
import com.sajib.deshibazar.auth.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(
            @Valid @RequestBody RegisterRequest request
    ) {
        authService.register(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body("Registration successful");
    }

    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request
    ) {
        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    @PostMapping("/refresh")
    public ResponseEntity<RefreshResponse> refresh(
            @Valid @RequestBody RefreshRequest request
    ) {
        RefreshResponse response = authService.refresh(request);

        return ResponseEntity.ok(response);
    }
}
