package com.storeapplication.services;

import com.storeapplication.models.Payment;
import com.storeapplication.models.PaymentStatus;
import com.storeapplication.repository.PaymentRepository;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class PaymentService {
    private PaymentRepository paymentRepository;

    public PaymentService(PaymentRepository paymentRepository) {
        this.paymentRepository = paymentRepository;
    }


    public String addPayment(Payment payment) {
        paymentRepository.save(payment);
        return "Payment added successfully";
    }

    public Payment getPaymentById(Long id) {
        return paymentRepository.findById(id).orElse(null);
    }

    public Payment getPaymentByOrderId(Long orderId) {
        return paymentRepository.findByOrderId(orderId).orElse(null);
    }

    public Payment getPaymentByAuthority(String authority) {
        return paymentRepository.findByAuthority(authority).orElse(null);
    }

    public String updatePayment(Long id, PaymentStatus status) {
        Optional<Payment> paymentOpt = paymentRepository.findById(id);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setPaymentStatus(status);
            paymentRepository.save(payment); // اینجا ذخیره کنیم
            return "Payment updated successfully";
        }
        return "Payment not found";
    }

    public String updatePaymentByAuthority(String authority, PaymentStatus status) {
        Optional<Payment> paymentOpt = paymentRepository.findByAuthority(authority);
        if (paymentOpt.isPresent()) {
            Payment payment = paymentOpt.get();
            payment.setPaymentStatus(status);
            paymentRepository.save(payment);
            return "Payment updated successfully";
        }
        return "Payment not found";
    }

}
