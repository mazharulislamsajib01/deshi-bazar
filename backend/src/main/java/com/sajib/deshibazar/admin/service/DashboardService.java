package com.sajib.deshibazar.admin.service;

import com.sajib.deshibazar.admin.dto.DashboardResponse;
import com.sajib.deshibazar.order.entity.Order;
import com.sajib.deshibazar.order.repository.OrderRepository;
import com.sajib.deshibazar.payment.entity.PaymentStatus;
import com.sajib.deshibazar.payment.repository.PaymentRepository;
import com.sajib.deshibazar.product.repository.ProductRepository;
import com.sajib.deshibazar.user.entity.UserRole;
import com.sajib.deshibazar.user.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class DashboardService {

    private final UserRepository userRepository;
    private final ProductRepository productRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public DashboardService(
            UserRepository userRepository,
            ProductRepository productRepository,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository
    ) {
        this.userRepository = userRepository;
        this.productRepository = productRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    public DashboardResponse getDashboardData() {

        DashboardResponse response = new DashboardResponse();

        response.setTotalUsers(userRepository.count());

        response.setTotalCustomers(
                userRepository.countByRole(UserRole.CUSTOMER)
        );

        response.setTotalSellers(
                userRepository.countByRole(UserRole.SELLER)
        );

        response.setTotalProducts(productRepository.count());

        response.setTotalOrders(orderRepository.count());

        response.setTotalRevenue(
                paymentRepository.sumAmountByStatus(PaymentStatus.SUCCESS)
        );

        List<DashboardResponse.RecentOrder> recentOrders =
                orderRepository.findTop5ByOrderByCreatedAtDesc()
                        .stream()
                        .map(this::convertToRecentOrder)
                        .toList();

        response.setRecentOrders(recentOrders);

        return response;
    }

    private DashboardResponse.RecentOrder convertToRecentOrder(Order order) {

        DashboardResponse.RecentOrder recentOrder =
                new DashboardResponse.RecentOrder();

        recentOrder.setOrderId(order.getId());
        recentOrder.setCustomerName(order.getUser().getName());
        recentOrder.setTotalAmount(order.getTotalAmount());
        recentOrder.setStatus(order.getStatus().name());

        return recentOrder;
    }
}
