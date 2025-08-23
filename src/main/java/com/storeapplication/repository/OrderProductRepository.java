package com.storeapplication.repository;

import com.storeapplication.models.CartItem;
import com.storeapplication.models.Order;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderProductRepository extends JpaRepository<Order,Long> {
}
