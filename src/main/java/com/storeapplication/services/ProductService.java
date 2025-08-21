package com.storeapplication.services;

import com.storeapplication.models.Product;
import com.storeapplication.repository.ProductRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {

    @Autowired
    private ProductRepository productRepository;

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    public Product getProductById(Long id) {
        return productRepository.findById(id).orElse(null);
    }

    public String createProduct(Product product) {
        Product findedProduct = productRepository.findByProductNameAndCategoryId(product.getProductName(),product.getCategory().getId()).orElse(null);
        if (findedProduct == null) {
            productRepository.save(product);
            return null;
        }
        return "product already exists with this category";
    }

    public String updateProduct(Long id, Product productDetails) {
        Product product = productRepository.findById(id)
                .orElse(null);

        if  (product == null) {
            return "product not found";
        }

        if (product.getProductName() != null) {
            product.setProductName(productDetails.getProductName());
        }

        if (product.getProductDescription() != null) {
            product.setProductDescription(productDetails.getProductDescription());
        }

        if (product.getProductPrice() != null) {
            product.setProductPrice(productDetails.getProductPrice());
        }

        if (product.getProductDiscount() != null) {
            product.setProductDiscount(productDetails.getProductDiscount());
        }

        if (product.getProductQuantity() != null) {
            product.setProductQuantity(productDetails.getProductQuantity());
        }

        if (product.getProductImages() != null) {
            product.setProductImages(productDetails.getProductImages());
        }

        if (product.getCategory() != null) {
            product.setCategory(productDetails.getCategory());
        }

        productRepository.save(product);
        return null;
    }

    public String deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElse(null);
        if (product == null) {
            return "Product not found for this id :: " + id;
        }
        productRepository.delete(product);
        return null;
    }
}