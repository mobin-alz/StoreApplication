package com.storeapplication.controller;

import com.storeapplication.dto.request.WishListRequestDto;
import com.storeapplication.dto.response.BaseResponse;
import com.storeapplication.models.Product;
import com.storeapplication.models.User;
import com.storeapplication.models.WishList;
import com.storeapplication.services.WishListService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/wish-list")
public class WishListController {


    private final WishListService wishListService;
    public WishListController(WishListService wishListService) {
        this.wishListService = wishListService;
    }

    public WishList DtoToEntity(WishListRequestDto req){
        WishList wishList = new WishList();
        User user = new User();
        user.setId(req.getUserId());
        Product product = new Product();
        product.setProductId(req.getProductId());
        wishList.setUser(user);
        wishList.setProduct(product);

        return wishList;
    }


    @PostMapping
    public ResponseEntity<BaseResponse> saveWishList(@RequestBody WishListRequestDto req) {

        try {
            WishList wishList = DtoToEntity(req);
            String msg = wishListService.save(wishList);
            return ResponseEntity.ok(new BaseResponse(msg,true));
        }catch (Exception e){
            return ResponseEntity.status(500).body(new BaseResponse(e.getMessage(),false));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<BaseResponse> deleteWishList(@PathVariable Long id){
        String msg = wishListService.delete(id);
        if (msg == null) {
            return ResponseEntity.ok(new BaseResponse("Successfully Deleted with id : " + id,true));
        }
        return ResponseEntity.status(400).body(new BaseResponse(msg,false));
    }

    @GetMapping("/{userid}")
    public ResponseEntity<?> getWishList(@PathVariable Long userid){
        List<WishList> wishLists = wishListService.findByUserId(userid);
        if (wishLists.isEmpty()) {
            return ResponseEntity.status(404).body(new BaseResponse("WishList Not Found",false));
        }
        return ResponseEntity.status(200).body(wishLists);
    }



}
