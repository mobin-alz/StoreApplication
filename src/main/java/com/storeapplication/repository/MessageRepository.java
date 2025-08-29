package com.storeapplication.repository;

import com.storeapplication.models.Message;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MessageRepository extends JpaRepository<Message,Long> {
    List<Message> findByStatusIgnoreCase(String status);
}
