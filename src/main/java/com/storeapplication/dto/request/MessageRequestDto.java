package com.storeapplication.dto.request;


import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequestDto {
    private String message;
    private String messageType;
    private String cssClass;
}
