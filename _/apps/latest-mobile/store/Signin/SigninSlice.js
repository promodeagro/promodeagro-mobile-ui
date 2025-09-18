import { createSlice } from "@reduxjs/toolkit";
import status from "../Constants";
import { fetchDefaultAddress, fetchPersonalDetails, signIn, validateOtp } from "./SigninThunk";

const initialState = {
  loginData: {
    status: '',
    data: null
  },
  validateOtpRes: {
    status: '',
    data: null
  },
  isAuthenticated: false,
  user: null,
  token: null,
  personalDetailsData: {
    status: '',
    data: null,
    error: null
  },
  defaultAddressData: {
    status: '',
    data: null,
    error: null
  },
};

const SigninSlice = createSlice({
  name: "login",
  initialState,
  reducers: {
    resetLogin: (state) => {
      state.loginData = initialState.loginData;
      state.validateOtpRes = initialState.validateOtpRes;
    },
    logout: (state) => {
      state.loginData = initialState.loginData;
      state.validateOtpRes = initialState.validateOtpRes;
      state.personalDetailsData = initialState.personalDetailsData;
      state.defaultAddressData = initialState.defaultAddressData;
      state.isAuthenticated = false;
      state.user = null;
      state.token = null;
    },
    // Test action to manually set authentication state with real user ID
    setTestAuth: (state) => {
      state.isAuthenticated = true;
      state.user = {
        id: "72527829-3f61-439a-9b31-6a91d84aaf74",
        userId: "72527829-3f61-439a-9b31-6a91d84aaf74",
        name: "Test User",
        phone: "8886834218",
        email: "test@example.com",
        token: "test-token"
      };
      state.token = "test-token";
    },
    clearErrors: (state) => {
      if (state.loginData.status === status.ERROR) {
        state.loginData.status = '';
        state.loginData.data = null;
      }
      if (state.validateOtpRes.status === status.ERROR) {
        state.validateOtpRes.status = '';
        state.validateOtpRes.data = null;
      }
      if (state.personalDetailsData.status === status.ERROR) {
        state.personalDetailsData.status = '';
        state.personalDetailsData.data = null;
      }
      if (state.defaultAddressData.status === status.ERROR) {
        state.defaultAddressData.status = '';
        state.defaultAddressData.data = null;
      }
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(signIn.pending, (state) => {
        state.loginData.status = status.IN_PROGRESS;
      })
      .addCase(signIn.fulfilled, (state, action) => {
        state.loginData.status = status.SUCCESS;
        state.loginData.data = action.payload;
      })
      .addCase(signIn.rejected, (state, action) => {
        state.loginData.status = status.ERROR;
        state.loginData.data = action.payload;
      })

      .addCase(validateOtp.pending, (state) => {
        state.validateOtpRes.status = status.IN_PROGRESS;
      })
      .addCase(validateOtp.fulfilled, (state, action) => {
        state.validateOtpRes.status = status.SUCCESS;
        state.validateOtpRes.data = action.payload;
        
        // If OTP validation is successful, set authentication state
        if (action.payload.statusCode === 200 && action.payload.data) {
          state.isAuthenticated = true;
          state.user = action.payload.data;
          state.token = action.payload.data.token;
        }
      })
      .addCase(validateOtp.rejected, (state, action) => {
        state.validateOtpRes.status = status.ERROR;
        state.validateOtpRes.data = action.payload;
      })

      // Personal Details
      .addCase(fetchPersonalDetails.pending, (state) => {
        state.personalDetailsData.status = status.IN_PROGRESS;
        state.personalDetailsData.error = null;
      })
      .addCase(fetchPersonalDetails.fulfilled, (state, action) => {
        state.personalDetailsData.status = status.SUCCESS;
        state.personalDetailsData.data = action.payload;
        state.personalDetailsData.error = null;
      })
      .addCase(fetchPersonalDetails.rejected, (state, action) => {
        state.personalDetailsData.status = status.ERROR;
        state.personalDetailsData.error = action.payload;
        state.personalDetailsData.data = null;
      })

      // Default Address
      .addCase(fetchDefaultAddress.pending, (state) => {
        state.defaultAddressData.status = status.IN_PROGRESS;
        state.defaultAddressData.error = null;
      })
      .addCase(fetchDefaultAddress.fulfilled, (state, action) => {
        state.defaultAddressData.status = status.SUCCESS;
        state.defaultAddressData.data = action.payload.data; // Extract the actual address data
        state.defaultAddressData.error = null;
      })
      .addCase(fetchDefaultAddress.rejected, (state, action) => {
        state.defaultAddressData.status = status.ERROR;
        state.defaultAddressData.error = action.payload;
        state.defaultAddressData.data = null;
      });
  },
});

export const { resetLogin, logout, setTestAuth, clearErrors } = SigninSlice.actions;
export default SigninSlice.reducer;
