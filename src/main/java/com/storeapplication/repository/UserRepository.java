package com.storeapplication.repository;

import com.storeapplication.models.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findUserByUsername(String username);

    @Query("SELECT CASE WHEN COUNT(u) > 0 THEN TRUE ELSE FALSE END FROM User u WHERE u.username = :username")
    Boolean usernameExist(String username);

    @Query("SELECT CASE WHEN COUNT(u)> 0 THEN TRUE ELSE FALSE END FROM User u WHERE u.username = :username and u.password =:password")
    String checkPassword(String username, String password);
}
