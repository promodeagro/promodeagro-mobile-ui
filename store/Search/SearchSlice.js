import { createSlice } from "@reduxjs/toolkit";
import status from "../Constants";
import { clearSearch, searchProducts } from "./SearchThunk";

const initialState = {
  searchData: {
    status: '',
    data: {
      hits: [],
      nbHits: 0,
      query: '',
    },
    error: null
  },
  searchQuery: '',
  isSearching: false,
};

const SearchSlice = createSlice({
  name: "search",
  initialState,
  reducers: {
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    },
    resetSearch: (state) => {
      state.searchData = initialState.searchData;
      state.searchQuery = '';
      state.isSearching = false;
    },
    setSearching: (state, action) => {
      state.isSearching = action.payload;
    },
    clearErrors: (state) => {
      state.searchData.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(searchProducts.pending, (state) => {
        state.searchData.status = status.IN_PROGRESS;
        state.searchData.error = null;
        state.isSearching = true;
      })
      .addCase(searchProducts.fulfilled, (state, action) => {
        state.searchData.status = status.SUCCESS;
        state.searchData.data = action.payload;
        state.searchData.error = null;
        state.isSearching = false;
      })
      .addCase(searchProducts.rejected, (state, action) => {
        state.searchData.status = status.ERROR;
        state.searchData.error = action.payload;
        state.isSearching = false;
      })

      .addCase(clearSearch.fulfilled, (state, action) => {
        state.searchData.status = status.SUCCESS;
        state.searchData.data = action.payload;
        state.searchQuery = '';
        state.isSearching = false;
      })
  },
});

export const { setSearchQuery, resetSearch, setSearching, clearErrors } = SearchSlice.actions;
export default SearchSlice.reducer;
