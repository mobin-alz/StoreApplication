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

    @GetMapping("/products/{id}")
    public String productDetail() {
        return "product-detail";
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
    
    @GetMapping("/wishlist")
    public String wishlist() {
        return "wishlist";
    }
    
    @GetMapping("/about")
    public String about() {
        return "about";
    }
    
    @GetMapping("/contact")
    public String contact() {
        return "contact";
    }
    
    @GetMapping("/shopping-cart")
    public String shoppingCart() {
        return "shopping-cart";
    }   

    @GetMapping("/checkout")
    public String checkout() {
        return "checkout";
    }


    @GetMapping("/payment-success")
    public String paymentSuccess() {
        return "payment-success";
    }

    @GetMapping("/callback")
    public String callback() {
        return "callback";
    }

    @GetMapping("/dashboard/orders")
    public String dashboardOrders() {
        return "dashboard-orders";
    }

    @GetMapping("/admin/orders")
    public String adminOrders() {
        return "admin-orders";
    }

    @GetMapping("/order/{id}")
    public String orderDetail() {
        return "order-detail";
    }

    @GetMapping("/admin-messages")
    public String adminMessages() {
        return "admin-messages";
    }   
    
    @GetMapping("/dashboard/users")
    public String dashboardUsers() {
        return "dashboard-users";
    }
}
