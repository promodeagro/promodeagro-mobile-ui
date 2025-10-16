import AsyncStorage from "@react-native-async-storage/async-storage";
import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { Platform } from "react-native";
import { persistReducer, persistStore } from "redux-persist";

// Import slices
import AddressSlice from "./Address/AddressSlice";
import HomeSlice from "./Home/HomeSlice";
import SearchSlice from "./Search/SearchSlice";
import SigninSlice from "./Signin/SigninSlice";

// Use different storage for web to avoid window is not defined error
const storage = Platform.OS === 'web' ? 
  require('redux-persist/lib/storage').default : 
  AsyncStorage;

const persistConfig = {
  key: "root",
  storage: storage,
  whitelist: ["login"], // Only persist auth state
};

const rootReducer = combineReducers({
  login: SigninSlice,
  home: HomeSlice,
  search: SearchSlice,
  address: AddressSlice,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [
          "persist/FLUSH",
          "persist/REHYDRATE",
          "persist/PAUSE",
          "persist/PERSIST",
          "persist/PURGE",
          "persist/REGISTER",
        ],
      },
    }),
});

export const persistor = persistStore(store);
export default store;
