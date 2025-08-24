package com.storeapplication.controller;

import com.storeapplication.dto.request.CartItemRequestDto;
import com.storeapplication.dto.response.BaseResponse;
import com.storeapplication.models.CartItem;
import com.storeapplication.models.Product;
import com.storeapplication.models.ShoppingCart;
import com.storeapplication.services.CartItemService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/cart-items")
public class CartItemController {

    @Autowired
    private CartItemService cartItemService;

    @PostMapping
    public ResponseEntity<BaseResponse> addToCart(@RequestBody CartItemRequestDto cartItemRequest) {
        try {
            CartItem cartItem = convertToEntity(cartItemRequest);
            String msg = cartItemService.addToCart(cartItem);
            if (msg == null) {
                return ResponseEntity.ok(new BaseResponse("Successfully added to cart", true));
            }
            return ResponseEntity.status(400).body(new BaseResponse(msg, false));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new BaseResponse(e.getMessage(), false));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<BaseResponse> updateCartItem(@PathVariable Long id, @RequestBody CartItemRequestDto cartItemRequest) {
        try {
            CartItem cartItem = convertToEntity(cartItemRequest);
            String msg = cartItemService.updateCartItem(id, cartItem);
            if (msg == null) {
                return ResponseEntity.ok(new BaseResponse("Successfully updated cart item", true));
            }
            return ResponseEntity.status(400).body(new BaseResponse(msg, false));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new BaseResponse(e.getMessage(), false));
        }
    }


    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse> removeFromCart(@PathVariable Long id) {
        try {
            CartItem cartItem = cartItemService.findById(id);
            if (cartItem == null) {
                return ResponseEntity.status(404).body(new BaseResponse("Cart item not found", false));
            }
            
            String msg = cartItemService.removeFromCart(cartItem);
            if (msg == null) {
                return ResponseEntity.ok(new BaseResponse("Successfully removed from cart", true));
            }
            return ResponseEntity.status(400).body(new BaseResponse(msg, false));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new BaseResponse(e.getMessage(), false));
        }
    }

    @GetMapping("/cart/{cartId}")
    public ResponseEntity<?> getCartItems(@PathVariable Long cartId) {
        try {
            var cartItems = cartItemService.findByCartId(cartId);
            return ResponseEntity.ok(cartItems);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new BaseResponse(e.getMessage(), false));
        }
    }

    private CartItem convertToEntity(CartItemRequestDto dto) {
        CartItem cartItem = new CartItem();
        
        ShoppingCart cart = new ShoppingCart();
        cart.setId(dto.getCartId());
        cartItem.setCart(cart);
        
        Product product = new Product();
        product.setProductId(dto.getProductId());
        cartItem.setProduct(product);
        
        cartItem.setQuantity(dto.getQuantity());
        cartItem.setPrice(dto.getPrice());
        
        return cartItem;
    }
}
