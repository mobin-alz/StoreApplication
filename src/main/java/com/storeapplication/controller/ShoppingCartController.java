package com.storeapplication.controller;

import com.storeapplication.dto.request.ShoppingCarTRequestDto;
import com.storeapplication.dto.response.BaseResponse;
import com.storeapplication.dto.response.ShoppingCartResponseDto;
import com.storeapplication.models.ShoppingCart;
import com.storeapplication.models.User;
import com.storeapplication.services.ShoppingCartService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/shopping-cart")
public class ShoppingCartController {

    @Autowired
    private ShoppingCartService shoppingCartService;


    public ShoppingCart DtoToEntity(ShoppingCarTRequestDto shoppingCart) {
        ShoppingCart model = new ShoppingCart();
        User user = new User();
        user.setId(shoppingCart.getUserId());
        model.setUser(user);
        return model;
    }


    @PostMapping
    public ResponseEntity<BaseResponse> saveShoppingCart(@RequestBody ShoppingCarTRequestDto shoppingCart) {
        try {
            ShoppingCart shp = DtoToEntity(shoppingCart);
            String msg = shoppingCartService.save(shp);
            if (msg == null) {
                return ResponseEntity.ok(new BaseResponse("Successfully added cart",true));
            }
            return ResponseEntity.status(400).body(new BaseResponse(msg,false));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(new BaseResponse(e.getMessage(),false));
        }

    }

    @GetMapping("/{userid}")
    public ResponseEntity<?> getShoppingCartByUserId(@PathVariable Long userid) {
        ShoppingCart shoppingCart = shoppingCartService.findByUserUsername(userid);
        if (shoppingCart == null) {
            return ResponseEntity.status(404).body(new BaseResponse("Shopping cart not found for this user",false));
        }
        
        ShoppingCartResponseDto responseDto = convertToResponseDto(shoppingCart);
        return ResponseEntity.status(200).body(responseDto);
    }

    private ShoppingCartResponseDto convertToResponseDto(ShoppingCart shoppingCart) {
        ShoppingCartResponseDto dto = new ShoppingCartResponseDto();
        dto.setId(shoppingCart.getId());
        dto.setCartItems(shoppingCart.getCartItems());
        
        ShoppingCartResponseDto.UserResponseDto userDto = new ShoppingCartResponseDto.UserResponseDto();
        userDto.setId(shoppingCart.getUser().getId());
        userDto.setUsername(shoppingCart.getUser().getUsername());
        dto.setUser(userDto);
        
        return dto;
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse> deleteShoppingCartByUserId(@PathVariable Long id) {
        String msg = shoppingCartService.delete(id);
        if (msg == null) {
            return ResponseEntity.status(200).body(new BaseResponse("Successfully deleted cart",true));
        }
        return ResponseEntity.status(400).body(new BaseResponse(msg,false));
    }
}
