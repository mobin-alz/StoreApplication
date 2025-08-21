package com.storeapplication.dto.request;


import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
public class ProductRequestDto {

    private String productName;

    private String productDescription;

    private Float productPrice;

    private Integer productDiscount;

    private Integer productQuantity;

    private Long categoryId;
}
