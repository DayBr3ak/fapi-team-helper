import { configureStore } from "@reduxjs/toolkit";
import uiSlice from "./uiSlice";

globalThis.store = configureStore({
  reducer: {
    ui: uiSlice.reducer,
  },
});

export const store = globalThis.store;
