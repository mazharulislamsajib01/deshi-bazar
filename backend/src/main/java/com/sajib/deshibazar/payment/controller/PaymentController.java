
package com.sajib.deshibazar.payment.controller;

import com.sajib.deshibazar.payment.dto.PaymentRequest;
import com.sajib.deshibazar.payment.dto.PaymentResponse;
import com.sajib.deshibazar.payment.service.PaymentService;
import com.sajib.deshibazar.user.entity.User;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public PaymentResponse makePayment(
            @Valid @RequestBody PaymentRequest request,
            @AuthenticationPrincipal User user
    ) {
        return paymentService.makePayment(user, request);
    }
}
