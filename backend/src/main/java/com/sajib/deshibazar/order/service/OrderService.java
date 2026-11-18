
package com.sajib.deshibazar.order.service;

import com.sajib.deshibazar.cart.entity.Cart;
import com.sajib.deshibazar.cart.entity.CartItem;
import com.sajib.deshibazar.cart.repository.CartItemRepository;
import com.sajib.deshibazar.cart.repository.CartRepository;
import com.sajib.deshibazar.order.dto.OrderItemResponse;
import com.sajib.deshibazar.order.dto.OrderResponse;
import com.sajib.deshibazar.order.entity.Order;
import com.sajib.deshibazar.order.entity.OrderItem;
import com.sajib.deshibazar.order.entity.OrderStatus;
import com.sajib.deshibazar.order.repository.OrderRepository;
import com.sajib.deshibazar.product.entity.Product;
import com.sajib.deshibazar.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {

    private final OrderRepository orderRepository;
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;

    public OrderService(
            OrderRepository orderRepository,
            CartRepository cartRepository,
            CartItemRepository cartItemRepository
    ) {
        this.orderRepository = orderRepository;
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
    }

    @Transactional
    public OrderResponse createOrder(User user) {

        Cart cart = cartRepository.findByUserId(user.getId())
                .orElseThrow(() -> new IllegalArgumentException("Cart not found"));

        List<CartItem> cartItems = cartItemRepository.findByCartId(cart.getId());

        if (cartItems.isEmpty()) {
            throw new IllegalArgumentException("Cart is empty");
        }

        for (CartItem cartItem : cartItems) {
            Product product = cartItem.getProduct();

            if (!product.getActive()) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Product " + product.getName()
                                + " is no longer available. Please remove it from your cart."
                );
            }
        }

        Order order = new Order();
        order.setUser(user);
        order.setStatus(OrderStatus.PENDING);

        BigDecimal totalAmount = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (CartItem cartItem : cartItems) {

            OrderItem orderItem = new OrderItem();
            orderItem.setOrder(order);
            orderItem.setProduct(cartItem.getProduct());
            orderItem.setQuantity(cartItem.getQuantity());

            BigDecimal price = cartItem.getProduct().getPrice();
            orderItem.setPrice(price);

            BigDecimal subtotal = price.multiply(
                    BigDecimal.valueOf(cartItem.getQuantity())
            );

            totalAmount = totalAmount.add(subtotal);
            orderItems.add(orderItem);
        }

        order.setTotalAmount(totalAmount);
        order.setItems(orderItems);

        Order savedOrder = orderRepository.save(order);

        cartItemRepository.deleteAll(cartItems);

        return toOrderResponse(savedOrder);
    }

    @Transactional(readOnly = true)
    public List<OrderResponse> getMyOrders(User user) {

        List<Order> orders =
                orderRepository.findByUserIdOrderByCreatedAtDesc(user.getId());

        return orders.stream()
                .map(this::toOrderResponse)
                .toList();
    }

    // Admin: Get all customers' orders
    @Transactional(readOnly = true)
    public List<OrderResponse> getAllOrders() {

        List<Order> orders =
                orderRepository.findAllByOrderByCreatedAtDesc();

        return orders.stream()
                .map(this::toOrderResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public OrderResponse getOrderDetails(User user, Long orderId) {

        Order order = findOrderForUser(user, orderId);

        return toOrderResponse(order);
    }

    @Transactional
    public OrderResponse cancelOrder(User user, Long orderId) {

        Order order = findOrderForUser(user, orderId);

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Only pending orders can be cancelled"
            );
        }

        order.setStatus(OrderStatus.CANCELLED);

        Order savedOrder = orderRepository.save(order);

        return toOrderResponse(savedOrder);
    }

    @Transactional
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"
                ));

        OrderStatus currentStatus = order.getStatus();

        boolean validTransition =
                (currentStatus == OrderStatus.PENDING && newStatus == OrderStatus.PAID)
                        || (currentStatus == OrderStatus.PAID && newStatus == OrderStatus.SHIPPED)
                        || (currentStatus == OrderStatus.SHIPPED && newStatus == OrderStatus.DELIVERED);

        if (!validTransition) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Invalid order status transition"
            );
        }

        order.setStatus(newStatus);

        Order savedOrder = orderRepository.save(order);

        return toOrderResponse(savedOrder);
    }

    private Order findOrderForUser(User user, Long orderId) {

        Order order = orderRepository.findById(orderId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Order not found"
                ));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "You are not allowed to access this order"
            );
        }

        return order;
    }

    private OrderResponse toOrderResponse(Order order) {

        List<OrderItemResponse> itemResponses =
                order.getItems().stream()
                        .map(item -> new OrderItemResponse(
                                item.getProduct().getId(),
                                item.getProduct().getName(),
                                item.getPrice(),
                                item.getQuantity(),
                                item.getPrice().multiply(
                                        BigDecimal.valueOf(item.getQuantity())
                                )
                        ))
                        .toList();

        return new OrderResponse(
                order.getId(),
                order.getUser().getName(),
                order.getUser().getEmail(),
                order.getTotalAmount(),
                order.getStatus(),
                order.getCreatedAt(),
                itemResponses
        );
    }
}
