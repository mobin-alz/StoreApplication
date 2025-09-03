package com.storeapplication.dto.request;

import com.storeapplication.models.Order;
import com.storeapplication.models.Product;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderProductRequestDto {

    private Long order_id;

    private Long product_id;

    private int quantity;

    private BigDecimal priceAtOrderTime;

} 