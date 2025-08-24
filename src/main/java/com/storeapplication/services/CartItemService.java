package com.storeapplication.services;

import com.storeapplication.models.CartItem;
import com.storeapplication.models.Product;
import com.storeapplication.models.ShoppingCart;
import com.storeapplication.models.User;
import com.storeapplication.repository.CartItemRepository;
import com.storeapplication.repository.ProductRepository;
import com.storeapplication.repository.ShoppingCartRepository;
import com.storeapplication.repository.UserRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CartItemService {

    private final CartItemRepository cartItemRepository;
    private final ShoppingCartRepository shoppingCartRepository;
    private final ProductRepository productRepository;

    public CartItemService(CartItemRepository cartItemRepository, ShoppingCartRepository shoppingCartRepository, ProductRepository productRepository) {
        this.cartItemRepository = cartItemRepository;
        this.shoppingCartRepository = shoppingCartRepository;
        this.productRepository = productRepository;
    }

    public List<CartItem> findByCartId(Long cartId) {
        return cartItemRepository.findByCartId(cartId);
    }

    public String addToCart(CartItem cartItem) {
        ShoppingCart cart = shoppingCartRepository.findById(cartItem.getCart().getId()).orElse(null);
        if (cart == null) {
            return "cart not found with id " + cartItem.getCart().getId();
        }

        Product product = productRepository.findById(cartItem.getProduct().getProductId()).orElse(null);
        if (product == null) {
            return "product not found with id " + cartItem.getProduct().getProductId();
        }

        cartItemRepository.save(cartItem);
        return null;
    }

    public String removeFromCart(CartItem cartItem) {
        ShoppingCart cart = shoppingCartRepository.findById(cartItem.getCart().getId()).orElse(null);
        if (cart == null) {
            return "cart not found with id " + cartItem.getCart().getId();
        }

        Product product = productRepository.findById(cartItem.getProduct().getProductId()).orElse(null);
        if (product == null) {
            return "product not found with id " + cartItem.getProduct().getProductId();
        }

        cartItemRepository.delete(cartItem);
        return null;
    }

    public String updateCartItem(Long cartItemId, CartItem updatedCartItem) {
        CartItem existingCartItem = cartItemRepository.findById(cartItemId).orElse(null);
        if (existingCartItem == null) {
            return "cart item not found with id " + cartItemId;
        }

        ShoppingCart cart = shoppingCartRepository.findById(updatedCartItem.getCart().getId()).orElse(null);
        if (cart == null) {
            return "cart not found with id " + updatedCartItem.getCart().getId();
        }

        Product product = productRepository.findById(updatedCartItem.getProduct().getProductId()).orElse(null);
        if (product == null) {
            return "product not found with id " + updatedCartItem.getProduct().getProductId();
        }

        // Update the existing cart item with new values
        if (updatedCartItem.getQuantity() != null && updatedCartItem.getQuantity() > 0) {
        existingCartItem.setQuantity(updatedCartItem.getQuantity());
        }
        if (updatedCartItem.getPrice() != null) {
            existingCartItem.setPrice(updatedCartItem.getPrice());
        }
        if (updatedCartItem.getProduct() != null) {
            existingCartItem.setProduct(updatedCartItem.getProduct());
        }
        if (updatedCartItem.getCart() != null) {
            existingCartItem.setCart(updatedCartItem.getCart());
        }

        cartItemRepository.save(existingCartItem);
        return null;
    }

    public String updateCartItemQuantity(Long cartItemId, int newQuantity) {
        CartItem existingCartItem = cartItemRepository.findById(cartItemId).orElse(null);
        if (existingCartItem == null) {
            return "cart item not found with id " + cartItemId;
        }

        if (newQuantity <= 0) {
            return "quantity must be greater than 0";
        }

        existingCartItem.setQuantity(newQuantity);
        cartItemRepository.save(existingCartItem);
        return null;
    }

    public CartItem findById(Long cartItemId) {
        return cartItemRepository.findById(cartItemId).orElse(null);
    }
}
