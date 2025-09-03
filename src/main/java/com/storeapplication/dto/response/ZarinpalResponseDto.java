package com.storeapplication.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;
import java.util.List;

@Getter
@Setter
public class ZarinpalResponseDto {

    private DataDto data;
    private List<Object> errors;
}

@Getter
@Setter
class DataDto {
    private String authority;
    private int fee;

    @JsonProperty("fee_type")
    private String feeType;

    private int code;
    private String message;
}

@Getter
@Setter
class ErrorsDto {

}