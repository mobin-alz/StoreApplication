package com.storeapplication.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.storeapplication.dto.request.RequestZarinDto;
import com.storeapplication.dto.response.ZarinpalResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;

@RestController
@RequestMapping("/api/zarin")
public class ZarinController {

    private final String REQUEST_URL  = "https://sandbox.zarinpal.com/pg/v4/payment/request.json";
    private final String VERIFY_URL = "https://sandbox.zarinpal.com/pg/v4/payment/verify.json";
    private final RestTemplate restTemplate = new RestTemplate();


    @PostMapping("/request")
    public ResponseEntity<ZarinpalResponseDto> sendPaymentRequest(RequestZarinDto requestDto) {
        ResponseEntity<ZarinpalResponseDto> responseEntity = restTemplate.postForEntity(
                REQUEST_URL,
                requestDto,
                ZarinpalResponseDto.class
        );
        return responseEntity;
    }

}
