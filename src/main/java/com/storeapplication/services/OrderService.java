package com.storeapplication.services;

import com.storeapplication.models.Order;
import com.storeapplication.models.OrderStatus;
import com.storeapplication.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class OrderService {

    @Autowired
    private OrderRepository orderRepository;

    public OrderService(OrderRepository orderRepository) {
        this.orderRepository = orderRepository;
    }

    public Order findById(Long id) {
        return orderRepository.findById(id).orElse(null);
    }

    public String updateOrderStatus(Long id, OrderStatus orderStatus) {
        Order order = orderRepository.findById(id).orElse(null);
        if (order != null) {
            order.setStatus(orderStatus);
            orderRepository.save(order);
            return null;
        }
        return "order not found";
    }

    public String saveOrder(Order order) {
        try {
            Order savedOrder = orderRepository.save(order);
            return null;
        }catch (Exception e) {
            return e.getMessage();
        }
    }

    public List<Order> findAllByUserId(Long userId) {
        return orderRepository.findByUserId(userId);
    }

    public List<Order> findAll() {
        return orderRepository.findAll();
    }

    public String deleteOrder(Long id) {
        try {
            Order order = orderRepository.findById(id).orElse(null);
            if (order != null) {
                orderRepository.delete(order);
                return null;
            }
            return "Order not found";
        } catch (Exception e) {
            return e.getMessage();
        }
    }

    public String updateOrderUserId(Long id, Long userId) {
        try {
            Order order = orderRepository.findById(id).orElse(null);
            if (order != null) {
                order.setUserId(userId);
                orderRepository.save(order);
                return null;
            }
            return "Order not found";
        } catch (Exception e) {
            return e.getMessage();
        }
    }





}
