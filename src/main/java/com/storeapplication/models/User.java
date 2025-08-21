package com.storeapplication.models;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Entity
@NoArgsConstructor
@Table(name = "users")
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(unique = true, nullable = false)
    private String username;

    @Column(nullable = false)
    private String password;


    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private UserRole role;

    public User(Long id, String username, String password, UserRole role) {
        this.id = id;
        this.username = username;
        this.password = password;
        this.role = role;
    }

    public String getRole() {
        return role.toString();
    }

    public void setRole(String role) {
        if (role.equalsIgnoreCase("ADMIN")) {
            this.role = UserRole.ADMIN;
        } else if (role.equalsIgnoreCase("PROVIDER")) {
            this.role = UserRole.PROVIDER;
        }
        else {
            this.role = UserRole.USER;
        }
    }
}