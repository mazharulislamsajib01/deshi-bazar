package com.sajib.deshibazar.cart.controller;

import com.sajib.deshibazar.cart.dto.AddToCartRequest;
import com.sajib.deshibazar.cart.dto.CartItemResponse;
import com.sajib.deshibazar.cart.dto.CartResponse;
import com.sajib.deshibazar.cart.entity.CartItem;
import com.sajib.deshibazar.cart.service.CartItemService;
import com.sajib.deshibazar.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/cart")
public class CartController {

    private final CartItemService cartItemService;

    public CartController(CartItemService cartItemService) {
        this.cartItemService = cartItemService;
    }

    private CartItemResponse toResponse(CartItem item) {
        var product = item.getProduct();

        return new CartItemResponse(
                item.getId(),
                product.getId(),
                product.getName(),
                product.getPrice(),
                item.getQuantity(),
                product.getPrice().multiply(
                        BigDecimal.valueOf(item.getQuantity())
                ),
                product.getImageUrl(),
                product.getStock()
        );
    }

    @PostMapping("/items")
    public ResponseEntity<CartItemResponse> addToCart(
            @Valid @RequestBody AddToCartRequest request,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        CartItem item = cartItemService.addProductToCart(
                user,
                request.getProductId(),
                request.getQuantity()
        );

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(toResponse(item));
    }

    @PutMapping("/items/{productId}")
    public ResponseEntity<CartItemResponse> updateQuantity(
            @PathVariable Long productId,
            @RequestParam Integer quantity,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        CartItem item = cartItemService.updateQuantity(
                user,
                productId,
                quantity
        );

        return ResponseEntity.ok(toResponse(item));
    }

    @DeleteMapping("/items/{productId}")
    public ResponseEntity<Void> removeCartItem(
            @PathVariable Long productId,
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        cartItemService.removeCartItem(user, productId);

        return ResponseEntity.noContent().build();
    }

    @DeleteMapping
    public ResponseEntity<Void> clearCart(Authentication authentication) {
        User user = (User) authentication.getPrincipal();

        cartItemService.clearCart(user);

        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<CartResponse> getCart(
            Authentication authentication
    ) {
        User user = (User) authentication.getPrincipal();

        CartResponse response = cartItemService.getCart(user);

        return ResponseEntity.ok(response);
    }
}
