package com.storeapplication.services;

import com.storeapplication.models.Comment;
import com.storeapplication.repository.CommentRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class CommentService {

    private final CommentRepository commentRepository;
    public CommentService(CommentRepository commentRepository) {
        this.commentRepository = commentRepository;
    }


    public String save(Comment comment)
    {
        commentRepository.save(comment);
        return "Comment saved successfully";
    }

    public Comment findById(Long id) {
        return commentRepository.findById(id).orElseThrow(() -> new RuntimeException("Comment not found for this id :: " + id));
    }

    public List<Comment> findAllByProductId(Long productId) {
        return commentRepository.findByProduct_ProductId(productId);
    }

    public String deleteById(Long id) {
        Comment comment = commentRepository.findById(id).orElse(null);
        if (comment == null) {
            return  "Comment not found for this id :: " + id;
        }
        commentRepository.delete(comment);
        return null;
    }

    public String update(Comment comment) {
        Comment findComment = commentRepository.findById(comment.getId()).orElse(null);
        if (findComment == null) {
            return "Comment not found for this id :: " + comment.getId();
        }

        if (comment.getComment() != null) {
            findComment.setComment(comment.getComment());
        }

        commentRepository.save(findComment);
        return null;
    }


}
