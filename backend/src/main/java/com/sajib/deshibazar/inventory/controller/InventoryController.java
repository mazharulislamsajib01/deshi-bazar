package com.sajib.deshibazar.inventory.controller;

import com.sajib.deshibazar.inventory.dto.StockUpdateRequest;
import com.sajib.deshibazar.product.entity.Product;
import com.sajib.deshibazar.product.repository.ProductRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/inventory")
public class InventoryController {

    private final ProductRepository productRepository;

    public InventoryController(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    @PostMapping("/{productId}/stock-in")
    public ResponseEntity<?> stockIn(
            @PathVariable Long productId,
            @RequestBody StockUpdateRequest request) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            return ResponseEntity.badRequest().body("Quantity must be greater than 0");
        }

        product.setStock(product.getStock() + request.getQuantity());
        productRepository.save(product);

        return ResponseEntity.ok(product);
    }

    @PostMapping("/{productId}/stock-out")
    public ResponseEntity<?> stockOut(
            @PathVariable Long productId,
            @RequestBody StockUpdateRequest request) {

        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new RuntimeException("Product not found"));

        if (request.getQuantity() == null || request.getQuantity() <= 0) {
            return ResponseEntity.badRequest().body("Quantity must be greater than 0");
        }

        if (product.getStock() < request.getQuantity()) {
            return ResponseEntity.badRequest().body("Insufficient stock");
        }

        product.setStock(product.getStock() - request.getQuantity());
        productRepository.save(product);

        return ResponseEntity.ok(product);
    }
}

