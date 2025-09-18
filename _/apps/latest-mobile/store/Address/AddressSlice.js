import { createSlice } from "@reduxjs/toolkit";
import status from "../Constants";
import { addAddress, fetchAllAddresses, setDefaultAddress } from "./AddressThunk";

const initialState = {
  addAddressData: {
    status: '',
    data: null,
    error: null
  },
  setDefaultAddressData: {
    status: '',
    data: null,
    error: null
  },
  allAddressesData: {
    status: '',
    data: [],
    error: null
  },
};

const AddressSlice = createSlice({
  name: "address",
  initialState,
  reducers: {
    resetAddressData: (state) => {
      state.addAddressData = initialState.addAddressData;
      state.setDefaultAddressData = initialState.setDefaultAddressData;
    },
    clearErrors: (state) => {
      state.addAddressData.error = null;
      state.setDefaultAddressData.error = null;
      state.allAddressesData.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Add Address
      .addCase(addAddress.pending, (state) => {
        state.addAddressData.status = status.IN_PROGRESS;
        state.addAddressData.error = null;
      })
      .addCase(addAddress.fulfilled, (state, action) => {
        state.addAddressData.status = status.SUCCESS;
        state.addAddressData.data = action.payload;
        state.addAddressData.error = null;
      })
      .addCase(addAddress.rejected, (state, action) => {
        state.addAddressData.status = status.ERROR;
        state.addAddressData.error = action.payload;
        state.addAddressData.data = null;
      })

      // Set Default Address
      .addCase(setDefaultAddress.pending, (state) => {
        state.setDefaultAddressData.status = status.IN_PROGRESS;
        state.setDefaultAddressData.error = null;
      })
      .addCase(setDefaultAddress.fulfilled, (state, action) => {
        state.setDefaultAddressData.status = status.SUCCESS;
        state.setDefaultAddressData.data = action.payload;
        state.setDefaultAddressData.error = null;
      })
      .addCase(setDefaultAddress.rejected, (state, action) => {
        state.setDefaultAddressData.status = status.ERROR;
        state.setDefaultAddressData.error = action.payload;
        state.setDefaultAddressData.data = null;
      })

      // Fetch All Addresses
      .addCase(fetchAllAddresses.pending, (state) => {
        state.allAddressesData.status = status.IN_PROGRESS;
        state.allAddressesData.error = null;
      })
      .addCase(fetchAllAddresses.fulfilled, (state, action) => {
        state.allAddressesData.status = status.SUCCESS;
        state.allAddressesData.data = action.payload.data;
        state.allAddressesData.error = null;
      })
      .addCase(fetchAllAddresses.rejected, (state, action) => {
        state.allAddressesData.status = status.ERROR;
        state.allAddressesData.error = action.payload;
        state.allAddressesData.data = [];
      })
  },
});

export const { resetAddressData, clearErrors } = AddressSlice.actions;
export default AddressSlice.reducer;
