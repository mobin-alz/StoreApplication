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
}
