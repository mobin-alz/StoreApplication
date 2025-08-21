package com.storeapplication.controller;

import com.storeapplication.dto.request.CommentRequestDto;
import com.storeapplication.dto.response.BaseResponse;
import com.storeapplication.dto.response.CommentResponseDto;
import com.storeapplication.models.Comment;
import com.storeapplication.models.Product;
import com.storeapplication.models.User;
import com.storeapplication.repository.CommentRepository;
import com.storeapplication.services.CommentService;
import com.storeapplication.services.ProductService;
import com.storeapplication.services.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/comments")
public class CommentController {

    @Autowired
    private CommentService commentService;

    @Autowired
    private ProductService productService;

    @Autowired
    private UserService userService;


    public Comment DtoToEntity(CommentRequestDto dto) {
        User user = userService.findById(Math.toIntExact(dto.getUserId()));

        Product product = productService.getProductById(dto.getProductId());

        Comment comment = new Comment();
        comment.setComment(dto.getComment());
        comment.setUser(user);
        comment.setProduct(product);

        return comment;
    }


    @GetMapping("/{id}")
    public ResponseEntity<List<CommentResponseDto>> findByProductId(@PathVariable Long id){
        List<Comment> comments = commentService.findAllByProductId(id);

        if (comments.isEmpty()){
            return ResponseEntity.notFound().build();
        }

        List<CommentResponseDto> response = new ArrayList<>();
        CommentResponseDto comnt =  new CommentResponseDto();
        for (Comment comment : comments){
            comnt.setId(comment.getId());
            comnt.setComment(comment.getComment());
            comnt.setUserName(comment.getUser().getUsername());

            response.add(comnt);
        }



        return ResponseEntity.ok().body(response);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse> deleteByProductId(@PathVariable Long id){
        String msg = commentService.deleteById(id);
        if ( msg != null) {
            return ResponseEntity.status(400).body(new BaseResponse(msg,false));
        }
        return ResponseEntity.status(200).body(new BaseResponse("Successfully Deleted",true));
    }


    @PostMapping
    public ResponseEntity<CommentResponseDto> createComment(@RequestBody CommentRequestDto req){
        Comment comment = DtoToEntity(req);
        CommentResponseDto response = new CommentResponseDto();
        response.setComment(comment.getComment());
        response.setUserName(comment.getUser().getUsername());
        response.setId(comment.getId());

        commentService.save(comment);
        return ResponseEntity.status(200).body(response);
    }



}
