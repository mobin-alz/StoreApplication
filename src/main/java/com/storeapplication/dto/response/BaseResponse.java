package com.storeapplication.dto.response;

import lombok.*;

@Data
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class BaseResponse {
    private String Message;
    private Boolean Success;
}
