package com.storeapplication.services;


import com.storeapplication.models.ShoppingCart;
import com.storeapplication.repository.ShoppingCartRepository;
import org.springframework.stereotype.Service;

@Service
public class ShoppingCartService {


    private final ShoppingCartRepository shoppingCartRepository;

    public ShoppingCartService(ShoppingCartRepository shoppingCartRepository) {
        this.shoppingCartRepository = shoppingCartRepository;
    }

    public String save(ShoppingCart shoppingCart) {

        ShoppingCart shp = findByUserUsername(shoppingCart.getUser().getId());
        if (shp == null) {
            shoppingCartRepository.save(shoppingCart);
            return null;
        }
        return "Shopping cart already exists for user with id : " +  shoppingCart.getUser().getId();
    }

    public ShoppingCart findByUserUsername(Long id) {
        return shoppingCartRepository.findByUserId(id).orElse(null);
    }

    public String delete(Long id) {
        ShoppingCart shp = shoppingCartRepository.findById(id).orElse(null);
        if (shp != null) {
            shoppingCartRepository.delete(shp);
            return null;
        }
        return "Shopping cart not found";
    }


}
