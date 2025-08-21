package com.storeapplication.controller;

import com.storeapplication.models.User;
import com.storeapplication.services.UserService;
import com.storeapplication.utils.JwtUtil;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

import static com.storeapplication.services.CustomUserDetailsService.requireRole;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private JwtUtil jwtUtil;

    private final UserService userService;

    public UserController(UserService userService) {
        this.userService = userService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<User> findById(@PathVariable Long id, HttpServletRequest request) {
        requireRole(request, jwtUtil, "ADMIN");
        return ResponseEntity.ok(userService.findById(Math.toIntExact(id)));
    }

    @PutMapping
    public ResponseEntity<User> update(@RequestBody User user, HttpServletRequest request) {
        requireRole(request, jwtUtil, "ADMIN");
        return ResponseEntity.ok(userService.update(user));
    }

    @GetMapping("/all")
    public ResponseEntity<List<User>> findAll(HttpServletRequest request) {
        requireRole(request, jwtUtil, "ADMIN");
        return ResponseEntity.ok(userService.findAll());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteById(@PathVariable Long id, HttpServletRequest request) {
        requireRole(request, jwtUtil, "ADMIN");
        userService.deleteById(Math.toIntExact(id));
        return ResponseEntity.ok().build();
    }
}
