import { configureStore } from "@reduxjs/toolkit";
import rootReducer from "./rootReducer";

// create Redux store
export const store = configureStore({
  reducer: rootReducer, // root reducer
  devTools: process.env.NODE_ENV !== "production", // enable devtools in development
});

export default store;