package com.storeapplication.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class DataDto {
    private String authority;
    private int fee;

    @JsonProperty("fee_type")
    private String feeType;

    private int code;
    private String message;
}
