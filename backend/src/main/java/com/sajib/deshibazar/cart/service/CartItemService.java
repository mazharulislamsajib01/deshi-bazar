
package com.sajib.deshibazar.cart.service;

import com.sajib.deshibazar.cart.dto.CartItemResponse;
import com.sajib.deshibazar.cart.dto.CartResponse;
import com.sajib.deshibazar.cart.entity.Cart;
import com.sajib.deshibazar.cart.entity.CartItem;
import com.sajib.deshibazar.cart.repository.CartItemRepository;
import com.sajib.deshibazar.cart.repository.CartRepository;
import com.sajib.deshibazar.product.entity.Product;
import com.sajib.deshibazar.product.repository.ProductRepository;
import com.sajib.deshibazar.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartItemService {

    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final CartService cartService;
    private final CartRepository cartRepository;

    public CartItemService(
            CartItemRepository cartItemRepository,
            ProductRepository productRepository,
            CartService cartService,
            CartRepository cartRepository
    ) {
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.cartService = cartService;
        this.cartRepository = cartRepository;
    }

    @Transactional
    public CartItem addProductToCart(
            User user,
            Long productId,
            Integer quantity
    ) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0"
            );
        }

        Product product = productRepository.findById(productId)
                .filter(Product::getActive)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Product not found or inactive"
                ));

        Cart cart = cartService.getOrCreateCart(user);

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseGet(() -> {
                    CartItem newItem = new CartItem();
                    newItem.setCart(cart);
                    newItem.setProduct(product);
                    newItem.setQuantity(0);
                    return newItem;
                });

        int newQuantity = cartItem.getQuantity() + quantity;

        if (newQuantity > product.getStock()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stocked Out"
            );
        }

        cartItem.setQuantity(newQuantity);

        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public CartItem updateQuantity(
            User user,
            Long productId,
            Integer quantity
    ) {

        if (quantity == null || quantity <= 0) {
            throw new IllegalArgumentException(
                    "Quantity must be greater than 0"
            );
        }

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart not found"));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart item not found"));

        Product product = cartItem.getProduct();

        if (!product.getActive()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "This product is no longer available"
            );
        }

        if (quantity > product.getStock()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Stocked Out"
            );
        }

        cartItem.setQuantity(quantity);

        return cartItemRepository.save(cartItem);
    }

    @Transactional
    public void removeCartItem(User user, Long productId) {

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart not found"));

        CartItem cartItem = cartItemRepository
                .findByCartIdAndProductId(cart.getId(), productId)
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart item not found"));

        cartItemRepository.delete(cartItem);
    }

    @Transactional
    public void clearCart(User user) {

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new IllegalArgumentException("Cart not found"));

        List<CartItem> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        cartItemRepository.deleteAll(cartItems);
    }

    @Transactional
    public CartResponse getCart(User user) {

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElse(null);

        if (cart == null) {
            return new CartResponse(List.of(), BigDecimal.ZERO);
        }

        List<CartItem> cartItems =
                cartItemRepository.findByCartId(cart.getId());

        // Remove inactive products from database cart
        List<CartItem> inactiveItems = cartItems.stream()
                .filter(item -> !item.getProduct().getActive())
                .toList();

        if (!inactiveItems.isEmpty()) {
            cartItemRepository.deleteAll(inactiveItems);
        }

        // Keep only active products
        List<CartItemResponse> items = cartItems.stream()
                .filter(item -> item.getProduct().getActive())
                .map(item -> {
                    Product product = item.getProduct();

                    BigDecimal subtotal = product.getPrice()
                            .multiply(BigDecimal.valueOf(item.getQuantity()));

                    return new CartItemResponse(
                            item.getId(),
                            product.getId(),
                            product.getName(),
                            product.getPrice(),
                            item.getQuantity(),
                            subtotal,
                            product.getImageUrl(),
                            product.getStock()
                    );
                })
                .toList();

        BigDecimal totalAmount = items.stream()
                .map(CartItemResponse::getSubtotal)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        return new CartResponse(items, totalAmount);
    }
}
