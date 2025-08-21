package com.storeapplication.services;

import com.storeapplication.models.User;
import com.storeapplication.repository.UserRepository;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public UserServiceImpl(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public User save(User user) {
        String hashedPassword = passwordEncoder.encode(user.getPassword());
        user.setPassword(hashedPassword);
        return userRepository.save(user);
    }

    @Override
    public User findById(int id) {
        return userRepository.findById((long) id)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }


    @Override
    public User update(User user) {
        User updateUser = userRepository.findById(user.getId()).orElseThrow(() -> new RuntimeException("User not found"));
        updateUser.setRole(user.getRole());
        return userRepository.save(updateUser);
    }

    @Override
    public Boolean usernameExist(String username) {
        return userRepository.usernameExist(username);
    }


    @Override
    public List<User> findAll() {
        return userRepository.findAll();
    }


    @Override
    public void deleteById(int id) {
        userRepository.deleteById((long) id);

    }




}