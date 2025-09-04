package com.storeapplication.dto.request;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

import java.util.HashMap;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class RequestZarinDto {
    @NotNull
    @NotBlank
    @Schema(defaultValue = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx")
    private String merchant_id;

    @NotNull
    @NotBlank
    private int amount;

    @NotNull
    @NotBlank
    private String description = "This is the description";

    @NotNull
    @NotBlank
    @Schema(defaultValue = "http://localhost:8080/callback")
    private String callback_url = "localhost:8080/callback";

    @Schema(type = "object", example = "{\"user_id\": \"1\", \"order_id\": \"123\"}")
    private HashMap<String,String> metadata = new HashMap<>();

}
