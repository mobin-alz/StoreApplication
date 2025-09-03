package com.storeapplication.repository;

import com.storeapplication.models.CartItem;
import com.storeapplication.models.Order;
import com.storeapplication.models.OrderProduct;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderProductRepository extends JpaRepository<OrderProduct,Long> {
}
