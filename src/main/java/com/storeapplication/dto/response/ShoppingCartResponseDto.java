package com.storeapplication.dto.response;

import com.storeapplication.models.CartItem;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ShoppingCartResponseDto {
    private Long id;
    private UserResponseDto user;
    private List<CartItem> cartItems;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class UserResponseDto {
        private Long id;
        private String username;
    }
} 