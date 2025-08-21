package com.storeapplication.controller;

import com.storeapplication.dto.request.ProductRequestDto;
import com.storeapplication.dto.response.BaseResponse;
import com.storeapplication.models.Category;
import com.storeapplication.models.Product;
import com.storeapplication.services.ProductService;
import com.storeapplication.utils.ImageUtil;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@RestController
@RequestMapping("/api/products")
@Tag(name = "Product Management", description = "Endpoints for managing products")
public class ProductController {

    @Autowired
    private ProductService productService;



    private Product convertDtoToEntity(ProductRequestDto productDto) {
        Product product = new Product();
        product.setProductName(productDto.getProductName());
        product.setProductDescription(productDto.getProductDescription());
        product.setProductPrice(productDto.getProductPrice());
        product.setProductDiscount(productDto.getProductDiscount());
        product.setProductQuantity(productDto.getProductQuantity());

        Category category = new Category();
        category.setId(productDto.getCategoryId());
        product.setCategory(category);

        return product;
    }

    @GetMapping
    @Operation(summary = "Get all products", description = "Retrieve a list of all products")
    public List<Product> getAllProducts() {
        return productService.getAllProducts();
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id) {
        Product product = productService.getProductById(id);
        if (product == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new BaseResponse("Product not found with id " + id, false));
        }
        return ResponseEntity.ok(product);
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
    public ResponseEntity<BaseResponse> createProduct(
            @Valid @RequestPart(value = "req") ProductRequestDto req,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws Exception {

        Product product = convertDtoToEntity(req);

        if (imageFile != null && !imageFile.isEmpty()) {
            String savedFileName = ImageUtil.saveImageWithOrientation(
                    imageFile,
                    System.getProperty("user.dir") + "/upload"
            );
            product.setProductImages(savedFileName);
        }

        String msg = productService.createProduct(product);

        if (msg != null) {
            return ResponseEntity.status(400).body(new BaseResponse(msg, false));
        }

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(new BaseResponse("Successfully Created Product", true));
    }


    @PutMapping(value = "/{id}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<BaseResponse> updateProduct(
            @PathVariable(value = "id") Long id,
            @RequestPart(value = "req" , required = false) ProductRequestDto req,
            @RequestPart(value = "image", required = false) MultipartFile imageFile) throws Exception {

        Product productDetails = convertDtoToEntity(req);

        if (imageFile != null && !imageFile.isEmpty()) {
            String savedFileName = ImageUtil.saveImageWithOrientation(
                    imageFile,
                    System.getProperty("user.dir") + "/upload"
            );
            productDetails.setProductImages(savedFileName);
        }

        String msg = productService.updateProduct(id, productDetails);

        if (msg != null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(new BaseResponse(msg, false));
        }

        return ResponseEntity.ok(new BaseResponse("Product Updated with id " + id, true));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse> deleteProduct(@PathVariable(value = "id") Long id) {
        String msg = productService.deleteProduct(id);
        if (msg != null) {
            return ResponseEntity.status(400).body(new BaseResponse(msg,false));
        }
        return ResponseEntity.status(200).body(new BaseResponse("Successfully Deleted",true));
    }
}