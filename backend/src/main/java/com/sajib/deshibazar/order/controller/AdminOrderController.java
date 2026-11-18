
package com.sajib.deshibazar.order.controller;

import com.sajib.deshibazar.order.dto.OrderResponse;
import com.sajib.deshibazar.order.service.OrderService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/orders")
public class AdminOrderController {

    private final OrderService orderService;

    public AdminOrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        List<OrderResponse> orders = orderService.getAllOrders();

        return ResponseEntity.ok(orders);
    }
}

