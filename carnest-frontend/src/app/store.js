import { userAuthApi } from '../services/userAuthApi';
import authReducer from '../features/authSlice';
import { configureStore } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import apiSliceReducer from '../features/apiSlice'; // Import only the reducer
import { apiService } from '../services/apiService';

export const store = configureStore({
  reducer: {
    [userAuthApi.reducerPath]: userAuthApi.reducer, // API slice for user authentication
    auth: authReducer, // Authentication reducer
    [apiService.reducerPath]: apiService.reducer, // API service reducer
    apiSlice: apiSliceReducer, // Pass the apiSlice reducer correctly here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware()
      .concat(userAuthApi.middleware) // Middleware for userAuthApi
      .concat(apiService.middleware), // Middleware for apiService
});

// Enable listeners for RTK Query
setupListeners(store.dispatch);
