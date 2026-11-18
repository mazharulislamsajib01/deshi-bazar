package com.sajib.deshibazar.cart.dto;

import java.math.BigDecimal;

public class CartItemResponse {

    private Long id;
    private Long productId;
    private String productName;
    private BigDecimal price;
    private Integer quantity;
    private BigDecimal subtotal;
    private String imageUrl;
    private Integer availableStock;

    public CartItemResponse(
            Long id,
            Long productId,
            String productName,
            BigDecimal price,
            Integer quantity,
            BigDecimal subtotal,
            String imageUrl,
            Integer availableStock
    ) {
        this.id = id;
        this.productId = productId;
        this.productName = productName;
        this.price = price;
        this.quantity = quantity;
        this.subtotal = subtotal;
        this.imageUrl = imageUrl;
        this.availableStock = availableStock;
    }

    public Long getId() {
        return id;
    }

    public Long getProductId() {
        return productId;
    }

    public String getProductName() {
        return productName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public String getImageUrl() {
        return imageUrl;
    }

    public Integer getAvailableStock() {
        return availableStock;
    }
}
