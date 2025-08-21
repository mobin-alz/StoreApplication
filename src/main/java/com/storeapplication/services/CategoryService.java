package com.storeapplication.services;

import com.storeapplication.models.Category;
import com.storeapplication.repository.CategoryRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.util.List;
import java.util.Optional;

@Service
public class CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Optional<Category> getCategoryById(Long id) {
        return categoryRepository.findById(id);
    }

    public String createCategory(Category category) throws IOException {
        Category cat = categoryRepository.findByName(category.getName()).orElse(null);
        if (cat != null) {
            return "Category Exist";
        }

        categoryRepository.save(category);
        return null;
    }

    public String updateCategory(Long id, Category categoryDetails) {
        Category category = categoryRepository.findById(id)
                .orElse(null);

        if (category == null) {
            return "Category Not Found";
        }

        if (categoryDetails.getName() != null) {
            category.setName(categoryDetails.getName());
        }

        if (category.getCategoryImage() != null) {
            category.setCategoryImage(category.getCategoryImage());
        }

        categoryRepository.save(category);
        return null;
    }

    public String deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElse(null);
        if (category == null) {
            return "Category Not Found";
        }
        categoryRepository.delete(category);
        return null;
    }
}