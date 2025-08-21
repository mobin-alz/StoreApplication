package com.storeapplication.dto.response;

import org.springframework.security.core.GrantedAuthority;

import java.util.Collection;

public class AuthResponseDto {
    private String token;
    private String username;
    private Collection<? extends GrantedAuthority> roles;

    public String getToken() {
        return token;
    }

    public String getUsername() {
        return username;
    }

    public Collection<? extends GrantedAuthority> getRoles() {
        return roles;
    }

    public AuthResponseDto(String token){
        this.token = token;
    }

    public AuthResponseDto(String token, String username, Collection<? extends GrantedAuthority> roles) {
        this.token = token;
        this.username = username;
        this.roles = roles;
    }
}
