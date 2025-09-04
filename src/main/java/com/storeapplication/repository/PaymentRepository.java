package com.storeapplication.repository;

import com.storeapplication.models.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByOrderId(Long id);
    Optional<Payment> findByAuthority(String authority);
}
