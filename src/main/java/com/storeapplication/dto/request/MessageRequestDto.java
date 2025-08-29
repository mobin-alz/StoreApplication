package com.storeapplication.dto.request;


import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class MessageRequestDto {
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String title;
    private String message;
}
