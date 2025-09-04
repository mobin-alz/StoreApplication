package com.storeapplication.models;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "order_id")
    private Order order;

    private BigDecimal amount;


    @Enumerated(EnumType.STRING)
    private PaymentStatus paymentStatus;

    private String merchant_id;

    private LocalDateTime createdAt = LocalDateTime.now();

    private String authority;
}