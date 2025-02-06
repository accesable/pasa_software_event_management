// src/redux/store.ts
import { configureStore } from '@reduxjs/toolkit';
import themeReducer from './theme/themeSlice';
import { persistStore, persistReducer } from 'redux-persist';
import storage from 'redux-persist/lib/storage';
import userReducer from './userSlice';
import eventDetailsReducer from './eventDetailsSlice'; // Import eventDetailsReducer

const persistConfig = {
  key: 'root',
  storage,
  blacklist: ['user', 'eventDetails'], // Blacklist eventDetails too if needed
};

const persistedThemeReducer = persistReducer(persistConfig, themeReducer);

export const store = configureStore({
  reducer: {
    theme: persistedThemeReducer,
    user: userReducer,
    eventDetails: eventDetailsReducer, // Add eventDetailsReducer here
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
});

export const persistor = persistStore(store);
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;