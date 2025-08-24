package com.storeapplication.controller;

import com.storeapplication.dto.request.OrderRequestDto;
import com.storeapplication.dto.request.OrderProductRequestDto;
import com.storeapplication.dto.response.BaseResponse;
import com.storeapplication.models.Order;
import com.storeapplication.models.OrderProduct;
import com.storeapplication.models.OrderStatus;
import com.storeapplication.models.Product;
import com.storeapplication.models.User;
import com.storeapplication.services.OrderService;
import com.storeapplication.services.ProductService;
import com.storeapplication.services.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/orders")
@Tag(name = "Order Management", description = "Endpoints for managing orders")
public class OrderController {

    @Autowired
    private OrderService orderService;

    @Autowired
    private UserService userService;

    @Autowired
    private ProductService productService;

    private Order convertDtoToEntity(OrderRequestDto orderDto) {
        Order order = new Order();
        
        User user = userService.findById(orderDto.getUserId().intValue());
        order.setUser(user);
        
        order.setTotalAmount(orderDto.getTotalAmount());
        
        List<OrderProduct> orderProducts = new ArrayList<>();
        for (OrderProductRequestDto productDto : orderDto.getOrderProducts()) {
            Product product = productService.getProductById(productDto.getProductId());
            if (product != null) {
                OrderProduct orderProduct = new OrderProduct();
                orderProduct.setOrder(order);
                orderProduct.setProduct(product);
                orderProduct.setQuantity(productDto.getQuantity());
                orderProduct.setPriceAtOrderTime(productDto.getPriceAtOrderTime());
                orderProducts.add(orderProduct);
            }
        }
        order.setOrderProducts(orderProducts);
        
        return order;
    }

    @GetMapping
    @Operation(summary = "Get all orders", description = "Retrieve a list of all orders")
    public ResponseEntity<List<Order>> getAllOrders() {
        List<Order> orders = orderService.findAll();
        return ResponseEntity.ok(orders);
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get order by ID", description = "Retrieve a specific order by its ID")
    public ResponseEntity<?> getOrderById(@PathVariable Long id) {
        Order order = orderService.findById(id);
        if (order == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new BaseResponse("Order not found with id " + id, false));
        }
        return ResponseEntity.ok(order);
    }

    @GetMapping("/user/{userId}")
    @Operation(summary = "Get orders by user ID", description = "Retrieve all orders for a specific user")
    public ResponseEntity<List<Order>> getOrdersByUserId(@PathVariable Long userId) {
        List<Order> orders = orderService.findAllByUserId(userId);
        return ResponseEntity.ok(orders);
    }

    @PostMapping
    @Operation(summary = "Create new order", description = "Create a new order with products")
    public ResponseEntity<BaseResponse> createOrder(@Valid @RequestBody OrderRequestDto orderRequestDto) {
        try {
            Order order = convertDtoToEntity(orderRequestDto);
            String result = orderService.saveOrder(order);
            
            if (result != null) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                        .body(new BaseResponse(result, false));
            }
            
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(new BaseResponse("Order created successfully", true));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(new BaseResponse("Error creating order: " + e.getMessage(), false));
        }
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update order status", description = "Update the status of an existing order")
    public ResponseEntity<BaseResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        
        String result = orderService.updateOrderStatus(id, status);
        
        if (result != null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new BaseResponse(result, false));
        }
        
        return ResponseEntity.ok(new BaseResponse("Order status updated successfully", true));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete order", description = "Delete an existing order")
    public ResponseEntity<BaseResponse> deleteOrder(@PathVariable Long id) {
        String result = orderService.deleteOrder(id);
        
        if (result != null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new BaseResponse(result, false));
        }
        
        return ResponseEntity.ok(new BaseResponse("Order deleted successfully", true));
    }

    @GetMapping("/status/{status}")
    @Operation(summary = "Get orders by status", description = "Retrieve all orders with a specific status")
    public ResponseEntity<List<Order>> getOrdersByStatus(@PathVariable OrderStatus status) {
        return ResponseEntity.ok(new ArrayList<>());
    }
} 