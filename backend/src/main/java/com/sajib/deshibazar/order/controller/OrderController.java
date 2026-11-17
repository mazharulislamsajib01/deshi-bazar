
package com.sajib.deshibazar.order.controller;

import com.sajib.deshibazar.order.dto.OrderResponse;
import com.sajib.deshibazar.order.entity.OrderStatus;
import com.sajib.deshibazar.order.service.OrderService;
import com.sajib.deshibazar.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        OrderResponse response = orderService.createOrder(user);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    @GetMapping
    public ResponseEntity<List<OrderResponse>> getMyOrders(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        List<OrderResponse> orders = orderService.getMyOrders(user);

        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{orderId}")
    public ResponseEntity<OrderResponse> getOrderDetails(
            @PathVariable Long orderId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        OrderResponse response = orderService.getOrderDetails(
                user,
                orderId
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{orderId}/cancel")
    public ResponseEntity<OrderResponse> cancelOrder(
            @PathVariable Long orderId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        OrderResponse response = orderService.cancelOrder(
                user,
                orderId
        );

        return ResponseEntity.ok(response);
    }

    @PutMapping("/{orderId}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long orderId,
            @RequestParam OrderStatus status
    ) {
        OrderResponse response = orderService.updateOrderStatus(
                orderId,
                status
        );

        return ResponseEntity.ok(response);
    }
}
