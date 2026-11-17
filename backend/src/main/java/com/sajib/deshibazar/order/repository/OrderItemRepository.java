
package com.sajib.deshibazar.order.repository;

import com.sajib.deshibazar.order.entity.OrderItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderItemRepository extends JpaRepository<OrderItem, Long> {
}

