// src\redux\userSlice.tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { User } from '../types';

const initialState: User = {
    id: '',
    email: '',
    name: '',
    avatar: '',
    phoneNumber: '',
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<User>) => {
            state.id = action.payload.id;
            state.email = action.payload.email;
            state.name = action.payload.name;
            state.avatar = action.payload.avatar;
            state.phoneNumber = action.payload.phoneNumber;
        },
        clearUser: (state) => {
            state.id = ''; 
            state.email = '';
            state.name = '';
            state.avatar = '';
            state.phoneNumber = '';
        },
        updateUserAvatar: (state, action: PayloadAction<string>) => { 
            state.avatar = action.payload;
        },
        updateUserProfile: (state, action: PayloadAction<{ name: string, phoneNumber: string }>) => { 
            state.name = action.payload.name;
            state.phoneNumber = action.payload.phoneNumber;
        },
    },
});

export const { setUser, clearUser, updateUserAvatar, updateUserProfile } = userSlice.actions;
export default userSlice.reducer;
