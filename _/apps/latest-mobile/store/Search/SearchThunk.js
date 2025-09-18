import { createAsyncThunk } from "@reduxjs/toolkit";

// Use working AWS Lambda endpoints for search functionality
const BASE_URL = "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod";

export const searchProducts = createAsyncThunk("search/searchProducts", async (query, { rejectWithValue }) => {
  try {
    if (!query || query.trim() === '') {
      return {
        hits: [],
        nbHits: 0,
        query: query,
      };
    }

    // Use homePageProducts endpoint and filter results locally
    // This is a workaround until the search endpoint is available
    const response = await fetch(`${BASE_URL}/homePageProducts`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter products based on search query
    const allProducts = [];
    
    // Flatten all products from all categories
    if (Array.isArray(data)) {
      data.forEach(category => {
        if (category.products && Array.isArray(category.products)) {
          category.products.forEach(product => {
            allProducts.push({
              ...product,
              category: category.categoryName || category.name,
              search_name: product.name,
              sellingPrice: product.variations?.[0]?.price || 0,
              groupId: product.groupId || product.id,
              objectID: product.groupId || product.id,
            });
          });
        }
      });
    }
    
    // Filter products based on search query
    const searchTermLower = query.toLowerCase();
    const filteredProducts = allProducts.filter(product => {
      const productName = (product.name || '').toLowerCase();
      const category = (product.category || '').toLowerCase();
      const tags = (product.tags || []).join(' ').toLowerCase();
      
      return productName.includes(searchTermLower) || 
             category.includes(searchTermLower) || 
             tags.includes(searchTermLower);
    });

    return {
      hits: filteredProducts,
      nbHits: filteredProducts.length,
      query: query,
    };
  } catch (error) {
    console.error('Search error:', error);
    return rejectWithValue({
      message: error.message || 'Search failed',
      query: query,
    });
  }
});

export const clearSearch = createAsyncThunk("search/clearSearch", async () => {
  return {
    hits: [],
    nbHits: 0,
    query: '',
  };
});
