package com.storeapplication.controller;

import com.storeapplication.dto.request.AuthRequestDto;
import com.storeapplication.dto.response.AuthResponseDto;
import com.storeapplication.dto.request.RegisterRequestDto;
import com.storeapplication.dto.response.RegisterResponseDto;
import com.storeapplication.models.User;
import com.storeapplication.services.CustomUserDetailsService;
import com.storeapplication.services.UserServiceImpl;
import com.storeapplication.utils.JwtUtil;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final AuthenticationManager authenticationManager;
    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService userDetailsService;
    private final UserServiceImpl userService;

    public AuthController(AuthenticationManager authenticationManager, JwtUtil jwtUtil, CustomUserDetailsService userDetailsService, UserServiceImpl userService) {
        this.authenticationManager = authenticationManager;
        this.jwtUtil = jwtUtil;
        this.userDetailsService = userDetailsService;
        this.userService = userService;
    }

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDto> createToken(@RequestBody AuthRequestDto request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));

        if (authentication.isAuthenticated()) {
            final UserDetails userDetails = userDetailsService.loadUserByUsername(request.getUsername());
            final String jwt = jwtUtil.generateToken(request.getUsername(), userDetails.getAuthorities());
            AuthResponseDto response = new AuthResponseDto(jwt, request.getUsername(), userDetails.getAuthorities());
            return new ResponseEntity<AuthResponseDto>(response, HttpStatus.OK);
        } else {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }


    @PostMapping("/register")
    public ResponseEntity<RegisterResponseDto> register(@RequestBody RegisterRequestDto request) {
        RegisterResponseDto response = new RegisterResponseDto();
        User user = new User();
        Boolean isUserExist =userService.usernameExist(request.getUsername());
        if (request.getUsername() == null || request.getUsername().length() < 3) {
            if (request.getUsername() == null){
                response.setMessage("Username Required");
                response.setSuccess(false);
            }
            else if (request.getUsername().length() < 3){
                response.setMessage("Username length should 3 char at least");
                response.setSuccess(false);
            }
        }
        if (request.getPassword() == null){
            response.setMessage("Password Required");
            response.setSuccess(false);
        }
        if (request.getRole() == null){
            response.setMessage("Role Required");
            response.setSuccess(false);

        }else {
            if (!request.getRole().equalsIgnoreCase("USER") && !request.getRole().equals("PROVIDER")){

                response.setMessage("Invalid Role");
                response.setSuccess(false);
            }
        }
        if (isUserExist){
            response.setMessage("User Exist");
            response.setSuccess(false);
        }

        if (!response.getSuccess()){
            return ResponseEntity.status(400).body(response);
        }
        User createdUser = new User();
        createdUser.setUsername(request.getUsername());
        createdUser.setPassword(request.getPassword());
        createdUser.setRole(request.getRole());
        userService.save(createdUser);
        response.setMessage("Successfully add new user with username: " + request.getUsername());
        return ResponseEntity.ok().body(response);



      }
}