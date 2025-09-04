package com.storeapplication.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class VerifyZarinDto {
    @NotNull
    @NotBlank
    @Schema(defaultValue = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
    private String merchant_id;

    @NotNull
    @NotBlank
    private int amount;

    @NotNull
    @NotBlank
    private String authority;
    
}
