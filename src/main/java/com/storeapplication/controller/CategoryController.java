package com.storeapplication.controller;

import com.storeapplication.dto.request.CategoryRequestDto;
import com.storeapplication.dto.response.BaseResponse;
import com.storeapplication.models.Category;
import com.storeapplication.services.CategoryService;
import com.storeapplication.utils.ImageUtil;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    @Autowired
    private CategoryService categoryService;

    // DTO TO ENTITY
    public Category DtoToEntity(CategoryRequestDto req) {
        Category category = new Category();
        category.setName(req.getCategoryName());
        return category;
    }


    // GET all categories
    @GetMapping
    public List<Category> getAllCategories() {
        return categoryService.getAllCategories();
    }

    // GET a single category by id
    @GetMapping("/{id}")
    public ResponseEntity<Category> getCategoryById(@PathVariable(value = "id") Long id) {
        return categoryService.getCategoryById(id)
                .map(category -> ResponseEntity.ok().body(category))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/images/{fileName}")
    public ResponseEntity<byte[]> getImage(@PathVariable String fileName) throws IOException {
        Path path = Paths.get(System.getProperty("user.dir") + "/upload/" + fileName);
        byte[] image = Files.readAllBytes(path);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .body(image);
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BaseResponse> createCategory(
            @Valid @RequestPart("req") CategoryRequestDto req,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws Exception {

        Category category = DtoToEntity(req);

        if (imageFile != null && !imageFile.isEmpty()) {
            String savedPath = ImageUtil.saveImageWithOrientation(imageFile,
                    System.getProperty("user.dir") + "/upload");
            category.setCategoryImage(savedPath);
        }

        String msg = categoryService.createCategory(category);
        if (msg != null) {
            return ResponseEntity.status(400).body(new BaseResponse(msg, false));
        }
        return ResponseEntity.status(200).body(new BaseResponse(req.getCategoryName() + " Successfully Created", true));
    }



    // PUT to update a category
    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BaseResponse> updateCategory(
            @PathVariable(value = "id") Long id,
            @Valid @RequestPart("req") CategoryRequestDto req,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws Exception {

        Category categoryDetails = DtoToEntity(req);

        if (imageFile != null && !imageFile.isEmpty()) {
            String savedPath = ImageUtil.saveImageWithOrientation(
                    imageFile,
                    System.getProperty("user.dir") + "/upload"
            );
            categoryDetails.setCategoryImage(savedPath);
        }

        String msg = categoryService.updateCategory(id, categoryDetails);
        if (msg != null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new BaseResponse(msg,false));
        }
        return ResponseEntity.ok().body(new BaseResponse("Successfully updated Category with id = " + id ,true));
    }

    // DELETE a category
    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse> deleteCategory(@PathVariable(value = "id") Long id) {
        String msg = categoryService.deleteCategory(id);

        if (msg   != null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new BaseResponse(msg,false));
        }
        return ResponseEntity.ok().body(new BaseResponse("Successfully delete Category with id = " + id ,true));
    }
}