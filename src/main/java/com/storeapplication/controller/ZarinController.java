package com.storeapplication.controller;

import com.storeapplication.dto.request.RequestZarinDto;
import com.storeapplication.dto.request.VerifyZarinDto;
import com.storeapplication.dto.response.ZarinpalResponseDto;
import com.storeapplication.models.Order;
import com.storeapplication.models.OrderStatus;
import com.storeapplication.models.Payment;
import com.storeapplication.models.PaymentStatus;
import com.storeapplication.repository.OrderRepository;
import com.storeapplication.services.OrderService;
import com.storeapplication.services.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/zarin")
public class ZarinController {

    private final RestTemplate restTemplate = new RestTemplate();
    private final PaymentService paymentService;
    private final OrderRepository orderRepository;
    private final OrderService orderService;

    public ZarinController(PaymentService paymentService, OrderRepository orderRepository, OrderService orderService) {
        this.paymentService = paymentService;
        this.orderRepository = orderRepository;
        this.orderService = orderService;
    }

    @PostMapping("/request")
    public ResponseEntity<ZarinpalResponseDto> sendPaymentRequest(@RequestBody RequestZarinDto requestDto) {
        String REQUEST_URL = "https://sandbox.zarinpal.com/pg/v4/payment/request.json";

        ResponseEntity<ZarinpalResponseDto> response = restTemplate.postForEntity(
                REQUEST_URL,
                requestDto,
                ZarinpalResponseDto.class
        );

        if (response.getBody() != null && response.getBody().getData() != null) {
            Payment payment = new Payment();
            payment.setPaymentStatus(PaymentStatus.INITIATED);
            payment.setAmount(BigDecimal.valueOf(requestDto.getAmount()));

            Order order = orderRepository.findById(
                            Long.valueOf(requestDto.getMetadata().get("order_id")))
                    .orElseThrow(() -> new RuntimeException("Order not found"));

            payment.setOrder(order);
            payment.setMerchant_id(requestDto.getMerchant_id());
            payment.setAuthority(response.getBody().getData().getAuthority());

            paymentService.addPayment(payment);
        }

        return response;
    }

    @PostMapping("/verify")
    public ResponseEntity<ZarinpalResponseDto> verifyPayment(@RequestBody VerifyZarinDto requestDto) {
        String VERIFY_URL = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";

        ResponseEntity<ZarinpalResponseDto> response = restTemplate.postForEntity(
                VERIFY_URL,
                requestDto,
                ZarinpalResponseDto.class
        );

        Payment payment = paymentService.getPaymentByAuthority(requestDto.getAuthority());
        if (payment != null && response.getBody() != null && response.getBody().getData() != null) {
            int code = response.getBody().getData().getCode();

            if (code == 100 || code == 101) {
                payment.setPaymentStatus(PaymentStatus.SUCCESS);
                orderService.updateOrderStatus(payment.getOrder().getId(), OrderStatus.PAID);
            } else {
                payment.setPaymentStatus(PaymentStatus.FAILED);
                }

            paymentService.updatePayment(payment.getId(),payment.getPaymentStatus());
        }

        return response;
    }



}
