package com.storeapplication.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storeapplication.dto.request.RequestZarinDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController
@RequestMapping("/api/zarin")
public class ZarinController {

    private final String REQUEST_URL  = "https://sandbox.zarinpal.com/pg/v4/payment/request.json";
    private final String VERIFY_URL = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";


    @PostMapping("/request")
    public ResponseEntity<String> createPaymentRequest() {
        try {
            RequestZarinDto requestDto = RequestZarinDto.builder()
                    .merchant_id("xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
                    .amount(1000)
                    .description(" فاکتور شماره ۱۲۳۴۵")
                    .callback_url("localhost:8080/callback")
                    .build();

            ObjectMapper objectMapper = new ObjectMapper();
            String requestBody = objectMapper.writeValueAsString(requestDto);

            HttpClient client = HttpClient.newHttpClient();
            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(REQUEST_URL))
                    .header("Content-Type", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(requestBody))
                    .build();

            HttpResponse<String> response = client.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() == 200) {
                return ResponseEntity.ok(response.body());
            } else {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Error: " + response.body());
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("An internal error occurred: " + e.getMessage());
        }
    }

}
