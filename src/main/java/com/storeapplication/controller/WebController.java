package com.storeapplication.controller;

import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class WebController {

    @GetMapping("/")
    public String index() {
        return "index";
    }

    @GetMapping("/products")
    public String products(Model model) {
        model.addAttribute("title", "list products");
        model.addAttribute("count", 10);
        return "products";
    }

    @GetMapping("/login")
    public String login() {
        return "login";
    }

    @GetMapping("/register")
    public String register() {
        return "register";
    }
    
    @GetMapping("/dashboard")
    public String dashboard() {
        return "dashboard";
    }

    @GetMapping("/categories")
    public String categories() {
        return "category";
    }
    
    @GetMapping("/dashboard/category")
    public String dashboardCategory() {
        return "categories";
    }
    
    @GetMapping("/dashboard/products")
    public String dashboardProducts() {
        return "dashboard-products";
    }
    
    @GetMapping("/about")
    public String about() {
        return "about";
    }
    
    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }
}
