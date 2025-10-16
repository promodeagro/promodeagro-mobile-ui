import { createSlice } from "@reduxjs/toolkit";
import status from "../Constants";
import { fetchCategories, fetchHomePageProducts, fetchOffers, fetchProductsBySubcategory } from "./HomeThunk";

const initialState = {
  categoriesData: {
    status: '',
    data: [],
    error: null
  },
  homePageProductsData: {
    status: '',
    data: [],
    error: null
  },
  offersData: {
    status: '',
    data: [],
    error: null
  },
  subcategoryProductsData: {
    status: '',
    data: [],
    error: null,
    subcategory: null
  },
};

const HomeSlice = createSlice({
  name: "home",
  initialState,
  reducers: {
    resetHomeData: (state) => {
      state.categoriesData = initialState.categoriesData;
      state.homePageProductsData = initialState.homePageProductsData;
      state.offersData = initialState.offersData;
      state.subcategoryProductsData = initialState.subcategoryProductsData;
    },
    clearErrors: (state) => {
      state.categoriesData.error = null;
      state.homePageProductsData.error = null;
      state.offersData.error = null;
      state.subcategoryProductsData.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Categories
      .addCase(fetchCategories.pending, (state) => {
        state.categoriesData.status = status.IN_PROGRESS;
        state.categoriesData.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.categoriesData.status = status.SUCCESS;
        state.categoriesData.data = action.payload.data;
        state.categoriesData.error = null;
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.categoriesData.status = status.ERROR;
        state.categoriesData.error = action.payload;
        state.categoriesData.data = [];
      })

      // Home Page Products
      .addCase(fetchHomePageProducts.pending, (state) => {
        state.homePageProductsData.status = status.IN_PROGRESS;
        state.homePageProductsData.error = null;
      })
      .addCase(fetchHomePageProducts.fulfilled, (state, action) => {
        state.homePageProductsData.status = status.SUCCESS;
        state.homePageProductsData.data = action.payload.data;
        state.homePageProductsData.error = null;
      })
      .addCase(fetchHomePageProducts.rejected, (state, action) => {
        state.homePageProductsData.status = status.ERROR;
        state.homePageProductsData.error = action.payload;
        state.homePageProductsData.data = [];
      })

      // Offers
      .addCase(fetchOffers.pending, (state) => {
        state.offersData.status = status.IN_PROGRESS;
        state.offersData.error = null;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        state.offersData.status = status.SUCCESS;
        state.offersData.data = action.payload.data;
        state.offersData.error = null;
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        state.offersData.status = status.ERROR;
        state.offersData.error = action.payload;
        state.offersData.data = [];
      })

      // Subcategory Products
      .addCase(fetchProductsBySubcategory.pending, (state) => {
        state.subcategoryProductsData.status = status.IN_PROGRESS;
        state.subcategoryProductsData.error = null;
      })
      .addCase(fetchProductsBySubcategory.fulfilled, (state, action) => {
        state.subcategoryProductsData.status = status.SUCCESS;
        state.subcategoryProductsData.data = action.payload.data;
        state.subcategoryProductsData.subcategory = action.payload.subcategory;
        state.subcategoryProductsData.error = null;
      })
      .addCase(fetchProductsBySubcategory.rejected, (state, action) => {
        state.subcategoryProductsData.status = status.ERROR;
        state.subcategoryProductsData.error = action.payload;
        state.subcategoryProductsData.data = [];
      })
  },
});

export const { resetHomeData, clearErrors } = HomeSlice.actions;
export default HomeSlice.reducer;
