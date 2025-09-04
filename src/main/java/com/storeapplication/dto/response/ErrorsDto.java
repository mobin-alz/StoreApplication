package com.storeapplication.dto.response;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ErrorsDto {
    private int code;
    private String message;
}
