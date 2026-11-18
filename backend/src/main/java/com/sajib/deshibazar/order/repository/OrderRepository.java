
package com.sajib.deshibazar.order.repository;

import com.sajib.deshibazar.order.entity.Order;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface OrderRepository extends JpaRepository<Order, Long> {

    List<Order> findByUserIdOrderByCreatedAtDesc(Long userId);

    List<Order> findTop5ByOrderByCreatedAtDesc();

    List<Order> findAllByOrderByCreatedAtDesc();
}
