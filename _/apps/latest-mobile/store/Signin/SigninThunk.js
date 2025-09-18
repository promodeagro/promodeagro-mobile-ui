import { createAsyncThunk } from "@reduxjs/toolkit";

// Use the same AWS Lambda endpoints as PWA
const BASE_URL = "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod";

const Config = {
  SIGN_IN: `${BASE_URL}/login`,
  VALIDATE_OTP: `${BASE_URL}/login/validate-otp`,
  FETCH_PERSONAL_DETAILS: `${BASE_URL}/getPersnalDetails`,
  GET_DEFAULT_ADDRESS: `${BASE_URL}/getDefaultAddress`,
};

export const signIn = createAsyncThunk("login", async (params) => {
  try {
    const response = await fetch(Config.SIGN_IN, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    return {
      data: data,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      message: error.message || 'Network error',
      statusCode: 500,
    };
  }
});

export const validateOtp = createAsyncThunk("otp", async (params) => {
  try {
    const response = await fetch(Config.VALIDATE_OTP, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    const data = await response.json();

    return {
      data: data,
      statusCode: response.status,
    };
  } catch (error) {
    return {
      message: error.message || 'Network error',
      statusCode: 500,
    };
  }
});

export const fetchPersonalDetails = createAsyncThunk("personalDetails", async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${Config.FETCH_PERSONAL_DETAILS}?userId=${userId}`, {
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
    console.error('Error fetching personal details:', error);
    return rejectWithValue({
      message: error.message || 'Failed to fetch personal details',
      statusCode: 500,
    });
  }
});

export const fetchDefaultAddress = createAsyncThunk("defaultAddress", async (userId, { rejectWithValue }) => {
  try {
    console.log('Fetching default address for userId:', userId);
    
    const response = await fetch(`${Config.GET_DEFAULT_ADDRESS}/${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    // The API returns the address data directly (not nested in data.data)
    // Structure: { house_number, address, landmark_area, zipCode, etc. }
    return {
      data: data, // Direct address object from API
      statusCode: response.status,
    };
  } catch (error) {
    console.error('Error fetching default address:', error);
    return rejectWithValue({
      message: error.message || 'Failed to fetch default address',
      statusCode: 500,
    });
  }
});
