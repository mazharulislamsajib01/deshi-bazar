
package com.sajib.deshibazar.payment.service;

import com.sajib.deshibazar.order.entity.Order;
import com.sajib.deshibazar.order.entity.OrderStatus;
import com.sajib.deshibazar.order.repository.OrderRepository;
import com.sajib.deshibazar.payment.dto.PaymentRequest;
import com.sajib.deshibazar.payment.dto.PaymentResponse;
import com.sajib.deshibazar.payment.entity.Payment;
import com.sajib.deshibazar.payment.entity.PaymentStatus;
import com.sajib.deshibazar.payment.repository.PaymentRepository;
import com.sajib.deshibazar.user.entity.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;

    public PaymentService(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository
    ) {
        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
    }

    @Transactional
    public PaymentResponse makePayment(User user, PaymentRequest request) {

        Order order = orderRepository.findById(request.getOrderId())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND, "Order not found"
                ));

        if (!order.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN, "You cannot pay for this order"
            );
        }

        if (order.getStatus() != OrderStatus.PENDING) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST, "Only pending orders can be paid"
            );
        }

        if (paymentRepository.findByOrderId(order.getId()).isPresent()) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT, "Payment already exists for this order"
            );
        }

        Payment payment = new Payment();

        payment.setOrder(order);
        payment.setAmount(order.getTotalAmount());
        payment.setPaymentMethod(request.getPaymentMethod().toUpperCase());
        payment.setStatus(PaymentStatus.SUCCESS);

        Payment savedPayment = paymentRepository.save(payment);

        order.setStatus(OrderStatus.PAID);
        orderRepository.save(order);

        return new PaymentResponse(
                savedPayment.getId(),
                order.getId(),
                savedPayment.getAmount(),
                savedPayment.getStatus(),
                savedPayment.getPaymentMethod(),
                savedPayment.getCreatedAt()
        );
    }
}
