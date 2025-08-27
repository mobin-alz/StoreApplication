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
