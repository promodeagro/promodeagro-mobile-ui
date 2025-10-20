// API Configuration
export const API_CONFIG = {
  // Update this to your actual API base URL
  BASE_URL: "http://localhost:8081/api",
  
  // External API endpoints
  EXTERNAL_ENDPOINTS: {
    CATEGORIES: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/getAllCategories",
    HOME_PAGE_PRODUCTS: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/homePageProducts",
    OFFERS: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/getOffers",
    PRODUCT_BY_GROUP_ID: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/productByGroupId",
    PRODUCTS_BY_SUBCATEGORY: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/getProductBySubCategory",
    GET_ALL_ADDRESSES: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/getAllAddress",
    ADD_CART_ITEMS: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/cart/addListOfItems",
    GET_CART_ITEMS: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/cart/getItems",
    PLACE_ORDER: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/order",
    GET_ORDER_BY_ID: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/getOrderById",
    GET_ORDERS_BY_USER_ID: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/order",
    GET_DELIVERY_SLOTS: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/slot",
    PAY_ORDER: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/order/pay",
    MODIFY_ORDER: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/order/modify",
    CANCEL_ORDER: "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod/order/cancel",
  },
  
  // API endpoints
  ENDPOINTS: {
    CATEGORIES: "/categories",
    PRODUCTS: "/products",
  },
  
  // Default query options
  DEFAULT_QUERY_OPTIONS: {
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 2,
  },
};

// Helper function to build full API URLs
export const buildApiUrl = (endpoint: string, params?: Record<string, string>) => {
  let url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  if (params) {
    const searchParams = new URLSearchParams(params);
    url += `?${searchParams.toString()}`;
  }
  
  return url;
};

// API Service Functions
export const apiService = {
  // Fetch categories from external API
  async fetchCategories() {
    try {
      const response = await fetch(API_CONFIG.EXTERNAL_ENDPOINTS.CATEGORIES);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Fetch home page products from external API
  async fetchHomePageProducts() {
    try {
      const response = await fetch(API_CONFIG.EXTERNAL_ENDPOINTS.HOME_PAGE_PRODUCTS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching home page products:', error);
      throw error;
    }
  },

  // Fetch offers from external API
  async fetchOffers() {
    try {
      const response = await fetch(API_CONFIG.EXTERNAL_ENDPOINTS.OFFERS);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching offers:', error);
      throw error;
    }
  },

  // Fetch product by group ID from external API
  async fetchProductByGroupId(groupId: string, userId?: string) {
    try {
      let url = `${API_CONFIG.EXTERNAL_ENDPOINTS.PRODUCT_BY_GROUP_ID}?groupId=${groupId}`;
      if (userId) {
        url += `&userId=${userId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching product by group ID:', error);
      throw error;
    }
  },

  // Fetch products by subcategory from external API
  async fetchProductsBySubcategory(subcategory: string) {
    try {
      const encodedSubcategory = encodeURIComponent(subcategory);
      const url = `${API_CONFIG.EXTERNAL_ENDPOINTS.PRODUCTS_BY_SUBCATEGORY}?subcategory=${encodedSubcategory}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching products by subcategory:', error);
      throw error;
    }
  },

  // Fetch all addresses for a user from external API
  async fetchAllAddresses(userId: string) {
    try {
      const url = `${API_CONFIG.EXTERNAL_ENDPOINTS.GET_ALL_ADDRESSES}/${userId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching addresses:', error);
      throw error;
    }
  },

  // Add items to cart via external API
  async addCartItems(userId: string, cartItems: Array<{productId: string, quantity: number, quantityUnits: string}>) {
    try {
      const payload = {
        userId: userId,
        cartItems: cartItems
      };
      
      const response = await fetch(API_CONFIG.EXTERNAL_ENDPOINTS.ADD_CART_ITEMS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      
      if (!response.ok) {
        let errorText = '';
        try {
          errorText = await response.text();
        } catch {}
        console.error('AddCartItems failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error adding cart items:', error);
      throw error;
    }
  },

  // Fetch cart items from external API
  async getCartItems(userId: string, addressId: string) {
    try {
      const url = `${API_CONFIG.EXTERNAL_ENDPOINTS.GET_CART_ITEMS}?userId=${userId}&addressId=${addressId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching cart items:', error);
      throw error;
    }
  },

  // Place order via external API
  async placeOrder(orderData: {
    addressId: string;
    deliverySlotId: string;
    items: Array<{
      productId: string;
      quantity: number;
      quantityUnits: string;
    }>;
    paymentDetails: {
      method: string;
    };
    userId: string;
  }) {
    try {
      const response = await fetch(API_CONFIG.EXTERNAL_ENDPOINTS.PLACE_ORDER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error placing order:', error);
      throw error;
    }
  },

  // Get order details by ID from external API
  async getOrderById(orderId: string) {
    try {
      const url = `${API_CONFIG.EXTERNAL_ENDPOINTS.GET_ORDER_BY_ID}/${orderId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching order details:', error);
      throw error;
    }
  },

  // Get orders by user ID from external API
  async getOrdersByUserId(userId: string) {
    try {
      const url = `${API_CONFIG.EXTERNAL_ENDPOINTS.GET_ORDERS_BY_USER_ID}/${userId}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching orders:', error);
      throw error;
    }
  },

  // Get delivery slots by pincode from external API
  async getDeliverySlots(pincode: string) {
    try {
      const url = `${API_CONFIG.EXTERNAL_ENDPOINTS.GET_DELIVERY_SLOTS}/${pincode}`;
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching delivery slots:', error);
      throw error;
    }
  },

  // Pay for an order
  async payOrder(orderId: string, paymentMethod: string = 'online', userId?: string, token?: string) {
    try {
      console.log('Paying for order:', orderId, 'with method:', paymentMethod);
      console.log('User ID:', userId);
      console.log('Token available:', !!token);
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      // Try without authentication headers first (like placeOrder)
      console.log('Making request without authentication headers (like placeOrder)');
      
      const requestBody = {
        orderId,
        paymentMethod,
        userId,
      };
      
      console.log('Request body:', requestBody);
      console.log('Request headers:', headers);
      console.log('API endpoint:', API_CONFIG.EXTERNAL_ENDPOINTS.PAY_ORDER);
      
      const response = await fetch(API_CONFIG.EXTERNAL_ENDPOINTS.PAY_ORDER, {
        method: 'POST',
        headers,
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Pay order failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
      }

      const result = await response.json();
      console.log('Pay order response:', result);
      return result;
    } catch (error) {
      console.error('Error paying for order:', error);
      throw error;
    }
  },

  // Modify an order
  async modifyOrder(orderId: string, modifications: any, userId?: string, token?: string) {
    try {
      console.log('Modifying order:', orderId, 'with modifications:', modifications);
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(API_CONFIG.EXTERNAL_ENDPOINTS.MODIFY_ORDER, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId,
          modifications,
          userId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Modify order failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
      }

      const result = await response.json();
      console.log('Modify order response:', result);
      return result;
    } catch (error) {
      console.error('Error modifying order:', error);
      throw error;
    }
  },

  // Cancel an order
  async cancelOrder(orderId: string, reason: string = 'Customer request', userId?: string, token?: string) {
    try {
      console.log('Cancelling order:', orderId, 'with reason:', reason);
      
      const headers: any = {
        'Content-Type': 'application/json',
      };
      
      const response = await fetch(API_CONFIG.EXTERNAL_ENDPOINTS.CANCEL_ORDER, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          orderId,
          reason,
          userId,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Cancel order failed:', response.status, errorText);
        throw new Error(`HTTP error! status: ${response.status}${errorText ? ` - ${errorText}` : ''}`);
      }

      const result = await response.json();
      console.log('Cancel order response:', result);
      return result;
    } catch (error) {
      console.error('Error cancelling order:', error);
      throw error;
    }
  },
};
