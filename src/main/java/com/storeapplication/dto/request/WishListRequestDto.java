package com.storeapplication.dto.request;


import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Getter
@Setter
public class WishListRequestDto {
    private Long userId;
    private Long productId;
}
