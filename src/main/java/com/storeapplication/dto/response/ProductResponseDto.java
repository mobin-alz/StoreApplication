package com.storeapplication.dto.response;

import lombok.Data;

@Data
public class ProductResponseDto {
    private Long id;

    private String productName;

    private String productDescription;

    private Float productPrice;

    private Integer productDiscount;

    private Integer productQuantity;

    private String productImages;

    private Long categoryId;
}
