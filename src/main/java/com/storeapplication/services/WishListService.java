package com.storeapplication.services;

import com.storeapplication.models.WishList;
import com.storeapplication.repository.WishListRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class WishListService {

    @Autowired
    private WishListRepository wishListRepository;


    public String save(WishList wishList) {
        wishListRepository.save(wishList);
        return "WishList saved successfully";
    }

    public List<WishList> findByUserId(Long userId) {
        return wishListRepository.findByUserId(userId);
    }

    public String delete(Long id) {
        WishList wishList = wishListRepository.findById(id).orElse(null);
        if  (wishList != null) {
            wishListRepository.delete(wishList);
            return null;
        }
        return "WishList not found";
    }
}
