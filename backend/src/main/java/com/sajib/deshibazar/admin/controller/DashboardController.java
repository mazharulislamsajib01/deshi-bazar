package com.sajib.deshibazar.admin.controller;

import com.sajib.deshibazar.admin.dto.DashboardResponse;
import com.sajib.deshibazar.admin.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping
    public ResponseEntity<DashboardResponse> getDashboard() {

        DashboardResponse response =
                dashboardService.getDashboardData();

        return ResponseEntity.ok(response);
    }
}

