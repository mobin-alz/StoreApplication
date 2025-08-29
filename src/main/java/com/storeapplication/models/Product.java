package com.storeapplication.models;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "products")

public class Product {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long productId;

    @NotBlank(message = "Product name is required")
    @Column(nullable = false)
    private String productName;

    @NotBlank(message = "Product description is required")
    private String productDescription;

    @NotNull(message = "Product price is required")
    @Min(value = 0, message = "Price cannot be negative")
    private Float productPrice;

    @Min(value = 0, message = "Discount cannot be negative")
    private Integer productDiscount;

    @Min(value = 0, message = "Quantity cannot be negative")
    private Integer productQuantity;

    private String productImages;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;
}