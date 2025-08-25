package com.storeapplication.dto.response;

import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class CommentResponseDto {

    private Long id;
    private String comment;
    private String userName;


}
