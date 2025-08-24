package com.storeapplication.dto.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CartItemRequestDto {
    private Long cartId;
    private Long productId;
    private int quantity;
    private BigDecimal price;
}