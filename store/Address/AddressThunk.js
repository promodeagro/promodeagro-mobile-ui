import { createAsyncThunk } from "@reduxjs/toolkit";

// Use the same AWS Lambda endpoints as PWA
const BASE_URL = "https://7x29t2x9xk.execute-api.ap-south-1.amazonaws.com/prod";

const Config = {
  ADD_ADDRESS: `${BASE_URL}/addAddress`,
  SET_DEFAULT_ADDRESS: `${BASE_URL}/setDefaultAddress`,
  GET_ALL_ADDRESS: `${BASE_URL}/getAllAddress`,
};

export const addAddress = createAsyncThunk("address/addAddress", async (addressData, { rejectWithValue }) => {
  try {
    const response = await fetch(Config.ADD_ADDRESS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
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
    console.error('Error adding address:', error);
    return rejectWithValue({
      message: error.message || 'Failed to add address',
      statusCode: 500,
    });
  }
});

export const setDefaultAddress = createAsyncThunk("address/setDefaultAddress", async (addressData, { rejectWithValue }) => {
  try {
    const response = await fetch(Config.SET_DEFAULT_ADDRESS, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(addressData),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      data: data,
      statusCode: response.status,
      addressId: addressData.addressId,
    };
  } catch (error) {
    console.error('Error setting default address:', error);
    return rejectWithValue({
      message: error.message || 'Failed to set default address',
      statusCode: 500,
    });
  }
});

export const fetchAllAddresses = createAsyncThunk("address/fetchAllAddresses", async (userId, { rejectWithValue }) => {
  try {
    const response = await fetch(`${Config.GET_ALL_ADDRESS}/${userId}`, {
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
    console.error('Error fetching addresses:', error);
    return rejectWithValue({
      message: error.message || 'Failed to fetch addresses',
      statusCode: 500,
    });
  }
});
