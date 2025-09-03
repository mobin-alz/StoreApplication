package com.storeapplication.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import lombok.*;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@Getter
@Setter
public class RequestZarinDto {
    @NotNull
    @NotBlank
    private String merchant_id = "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx";

    @NotNull
    @NotBlank
    private int amount;

    @NotNull
    @NotBlank
    private String description = "This is the description";

    @NotNull
    @NotBlank
    private String callback_url = "localhost:8080/callback";


}
