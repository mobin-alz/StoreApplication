package com.storeapplication.dto.request;

import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentRequestDto {
    private Long userId;
    private Long productId;
    private String comment;

}
