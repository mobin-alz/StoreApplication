package com.storeapplication.repository;

import com.storeapplication.models.CartItem;
import org.springframework.data.jpa.repository.JpaRepository;

public interface OrderProductRepository extends JpaRepository<CartItem,Long> {
}
