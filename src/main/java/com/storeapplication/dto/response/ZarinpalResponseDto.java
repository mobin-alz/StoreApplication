package com.storeapplication.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Getter;
import lombok.Setter;

import java.util.List;

@Getter
@Setter
public class ZarinpalResponseDto {
    private DataDto data;
    private List<ErrorsDto> errors;
}

