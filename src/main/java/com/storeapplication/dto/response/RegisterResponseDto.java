package com.storeapplication.dto.response;

public class RegisterResponseDto {
    private String message;
    private Boolean success = true;

    public String getMessage() {
        return message;
    }

    public Boolean getSuccess() {
        return success;
    }





    public void setMessage(String message) {
        this.message = message;
    }

    public void setSuccess(Boolean success) {
        this.success = success;
    }



    public RegisterResponseDto(){

    }

    public RegisterResponseDto(String message, Boolean success) {
        this.message = message;
        this.success = success;
    }
}
