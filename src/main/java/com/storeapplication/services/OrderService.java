package com.storeapplication.services;

import com.storeapplication.models.Order;
import com.storeapplication.repository.OrderProductRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class OrderService {


    private OrderProductRepository orderProductRepository;

    public OrderService(OrderProductRepository orderProductRepository) {
        this.orderProductRepository = orderProductRepository;
    }

    public Order findById(Long id) {
        return orderProductRepository.findById(id).orElse(null);
    }
//
//    public List<Order> findByUserId(Long userId) {
//        //TODO : IMPLEMENT LOGIC
//    }





}
