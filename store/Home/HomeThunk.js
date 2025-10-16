import { createAsyncThunk } from "@reduxjs/toolkit";

// Use the same AWS Lambda endpoints as PWA
const BASE_URL = "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod";

const Config = {
  CATEGORIES: `${BASE_URL}/getAllCategories`,
  HOME_PAGE_PRODUCTS: `${BASE_URL}/homePageProducts`,
  OFFERS: `${BASE_URL}/getOffers`,
  PRODUCTS_BY_SUBCATEGORY: `${BASE_URL}/getProductBySubCategory`,
};

export const fetchCategories = createAsyncThunk("home/fetchCategories", async (params, { rejectWithValue }) => {
  try {
    const response = await fetch(Config.CATEGORIES, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      data: data,
      statusCode: response.status,
    };
  } catch (error) {
    return rejectWithValue({
      message: error.message || 'Failed to fetch categories',
      statusCode: 500,
    });
  }
});

export const fetchHomePageProducts = createAsyncThunk("home/fetchHomePageProducts", async (params, { rejectWithValue }) => {
  try {
    const response = await fetch(Config.HOME_PAGE_PRODUCTS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      data: data,
      statusCode: response.status,
    };
  } catch (error) {
    return rejectWithValue({
      message: error.message || 'Failed to fetch home page products',
      statusCode: 500,
    });
  }
});

export const fetchOffers = createAsyncThunk("home/fetchOffers", async (params, { rejectWithValue }) => {
  try {
    const response = await fetch(Config.OFFERS, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      data: data,
      statusCode: response.status,
    };
  } catch (error) {
    return rejectWithValue({
      message: error.message || 'Failed to fetch offers',
      statusCode: 500,
    });
  }
});

export const fetchProductsBySubcategory = createAsyncThunk("home/fetchProductsBySubcategory", async (subcategoryName, { rejectWithValue }) => {
  try {
    const encodedSubcategory = encodeURIComponent(subcategoryName);
    const url = `${Config.PRODUCTS_BY_SUBCATEGORY}?subcategory=${encodedSubcategory}`;
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      data: data,
      statusCode: response.status,
      subcategory: subcategoryName,
    };
  } catch (error) {
    return rejectWithValue({
      message: error.message || 'Failed to fetch products by subcategory',
      statusCode: 500,
    });
  }
});
