package com.storeapplication.repository;

import com.storeapplication.models.Comment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CommentRepository extends JpaRepository<Comment,Long> {
    List<Comment> findByProduct_ProductId(Long productId);
}
