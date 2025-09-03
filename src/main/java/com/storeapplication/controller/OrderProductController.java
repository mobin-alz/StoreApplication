package com.storeapplication.controller;

import com.storeapplication.dto.request.OrderProductRequestDto;
import com.storeapplication.dto.response.BaseResponse;
import com.storeapplication.models.Order;
import com.storeapplication.models.OrderProduct;
import com.storeapplication.models.Product;
import com.storeapplication.services.OrderProductService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/order-product")
public class OrderProductController {
    private final OrderProductService orderProductService;

    public OrderProduct DtoToEntity(OrderProductRequestDto dto) {
        OrderProduct orderProduct = new OrderProduct();
        Product product = new Product();
        Order order = new Order();

        order.setId(dto.getOrder_id());
        product.setProductId(dto.getProduct_id());

        orderProduct.setProduct(product);
        orderProduct.setOrder(order);
        orderProduct.setQuantity(dto.getQuantity());
        orderProduct.setPriceAtOrderTime(dto.getPriceAtOrderTime());

        return orderProduct;

    }
    @Autowired
    public OrderProductController(OrderProductService orderProductService) {
        this.orderProductService = orderProductService;
    }


    @PostMapping("/")
    public ResponseEntity<BaseResponse> saveProduct(@RequestBody OrderProductRequestDto dto) {
        OrderProduct orderProduct = DtoToEntity(dto);
        String msg = orderProductService.addOrderProduct(orderProduct);
        return  ResponseEntity.ok().body(new BaseResponse(msg, true));
    }

    @DeleteMapping("/")
    public ResponseEntity<BaseResponse> removeProduct(@PathVariable Long id) {
        String msg = orderProductService.deleteOrderProduct(id);
        if (msg != null) {
            return  ResponseEntity.ok().body(new BaseResponse(msg, false));
        }
        return  ResponseEntity.ok().body(new BaseResponse("Order product deleted", true));
    }


}
