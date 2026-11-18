
package com.sajib.deshibazar.admin.controller;

import com.sajib.deshibazar.admin.dto.AdminUserResponse;
import com.sajib.deshibazar.admin.service.AdminUserService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/users")
public class AdminUserController {

    private final AdminUserService adminUserService;

    public AdminUserController(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    @GetMapping
    public ResponseEntity<List<AdminUserResponse>> getAllUsers() {

        List<AdminUserResponse> users =
                adminUserService.getAllUsers();

        return ResponseEntity.ok(users);
    }
}

