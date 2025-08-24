package com.storeapplication.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrderProductRequestDto {
    private Long productId;
    private int quantity;
    private BigDecimal priceAtOrderTime;
} 