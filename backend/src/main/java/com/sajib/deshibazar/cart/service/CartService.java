package com.sajib.deshibazar.cart.service;

import com.sajib.deshibazar.cart.entity.Cart;
import com.sajib.deshibazar.cart.repository.CartRepository;
import com.sajib.deshibazar.user.entity.User;
import org.springframework.stereotype.Service;

@Service
public class CartService {

    private final CartRepository cartRepository;

    public CartService(CartRepository cartRepository) {
        this.cartRepository = cartRepository;
    }

    public Cart getOrCreateCart(User user) {

        return cartRepository.findByUserId(user.getId())
                .orElseGet(() -> {
                    Cart cart = new Cart();
                    cart.setUser(user);
                    return cartRepository.save(cart);
                });
    }
}

