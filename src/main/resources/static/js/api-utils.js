// Utility functions for API requests with JWT token

// Get auth headers for API requests
function getAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        Authorization: token ? `Bearer ${token}` : "",
    };
}

// Get auth headers for multipart requests (no Content-Type for FormData)
function getMultipartAuthHeaders() {
    const token = localStorage.getItem("token");
    return {
        Authorization: token ? `Bearer ${token}` : "",
    };
}

// Make authenticated API request
async function apiRequest(url, options = {}) {
    const headers = getAuthHeaders();

    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        // If token is expired (401 response), logout user
        if (response.status === 401) {
            logout();
            window.location.href = "/login";
            return null;
        }

        // Handle other error statuses
        if (!response.ok) {
            console.error(
                `API request failed: ${response.status} ${response.statusText}`
            );
            return response;
        }

        return response;
    } catch (error) {
        console.error("API request failed:", error);
        throw error;
    }
}

// Make authenticated multipart API request (for file uploads)
async function multipartApiRequest(url, options = {}) {
    const headers = getMultipartAuthHeaders();

    const config = {
        ...options,
        headers: {
            ...headers,
            ...options.headers,
        },
    };

    try {
        const response = await fetch(url, config);

        // If token is expired (401 response), logout user
        if (response.status === 401) {
            logout();
            window.location.href = "/login";
            return null;
        }

        // Handle other error statuses
        if (!response.ok) {
            console.error(
                `Multipart API request failed: ${response.status} ${response.statusText}`
            );
            return response;
        }

        return response;
    } catch (error) {
        console.error("Multipart API request failed:", error);
        throw error;
    }
}

// Helper function to extract filename from full path (handles both Windows and Unix separators)
function extractFilename(filePath) {
    if (!filePath) return null;
    // Handle both Windows (\) and Unix (/) path separators
    const filename = filePath.split(/[\\\/]/).pop();
    return filename;
}

// Shopping Cart Functions
async function getOrCreateShoppingCart(userId) {
    try {
        // First try to get existing cart
        let response = await apiRequest(`/api/shopping-cart/${userId}`);

        if (response && response.ok) {
            return await response.json();
        } else if (response && response.status === 404) {
            // Create new cart if none exists
            const createResponse = await apiRequest("/api/shopping-cart", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ userId: parseInt(userId) }),
            });

            if (createResponse && createResponse.ok) {
                return await createResponse.json();
            }
        }
        return null;
    } catch (error) {
        console.error("Error getting/creating shopping cart:", error);
        return null;
    }
}

async function addItemToCart(cartId, productId, quantity, price) {
    try {
        const response = await apiRequest("/api/cart-items", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cartId: parseInt(cartId),
                productId: parseInt(productId),
                quantity: parseInt(quantity),
                price: parseFloat(price),
            }),
        });

        if (response && response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error("Error adding to cart:", error);
        return null;
    }
}

async function updateCartItem(cartItemId, cartId, productId, quantity, price) {
    try {
        const response = await apiRequest(`/api/cart-items/${cartItemId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                cartId: parseInt(cartId),
                productId: parseInt(productId),
                quantity: parseInt(quantity),
                price: parseFloat(price),
            }),
        });

        if (response && response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error("Error updating cart item:", error);
        return null;
    }
}

async function removeFromCart(cartItemId) {
    try {
        const response = await apiRequest(`/api/cart-items/${cartItemId}`, {
            method: "DELETE",
        });

        if (response && response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error("Error removing from cart:", error);
        return null;
    }
}

async function getCartItems(cartId) {
    try {
        const response = await apiRequest(`/api/cart-items/cart/${cartId}`);
        if (response && response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error("Error getting cart items:", error);
        return null;
    }
}

async function deleteShoppingCart(cartId) {
    try {
        const response = await apiRequest(`/api/shopping-cart/${cartId}`, {
            method: "DELETE",
        });

        if (response && response.ok) {
            return await response.json();
        }
        return null;
    } catch (error) {
        console.error("Error deleting shopping cart:", error);
        return null;
    }
}

// Example usage functions
async function getWishList() {
    const userId = localStorage.getItem("userId");
    if (!userId) return null;

    const response = await apiRequest(`/api/wish-list/${userId}`);
    if (response && response.ok) {
        return await response.json();
    }
    return null;
}

async function addToWishList(productId) {
    const userId = localStorage.getItem("userId");
    if (!userId) return null;

    const data = {
        userId: parseInt(userId),
        productId: parseInt(productId),
    };

    const response = await apiRequest("/api/wish-list", {
        method: "POST",
        body: JSON.stringify(data),
    });

    if (response && response.ok) {
        return await response.json();
    }
    return null;
}

async function removeFromWishList(wishListId) {
    const response = await apiRequest(`/api/wish-list/${wishListId}`, {
        method: "DELETE",
    });

    if (response && response.ok) {
        return await response.json();
    }
    return null;
}

// Make shopping cart functions globally accessible
window.addItemToCart = addItemToCart;
window.updateCartItem = updateCartItem;
window.removeFromCart = removeFromCart;
window.getCartItems = getCartItems;
window.deleteShoppingCart = deleteShoppingCart;
window.getOrCreateShoppingCart = getOrCreateShoppingCart;
