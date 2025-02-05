import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface UserState {
    id: string | null;
    email: string | null;
    name: string | null;
    avatar: string | null;
}

const initialState: UserState = {
    id: null,
    email: null,
    name: null,
    avatar: null,
};

const userSlice = createSlice({
    name: 'user',
    initialState,
    reducers: {
        setUser: (state, action: PayloadAction<UserState>) => {
            state.id = action.payload.id;
            state.email = action.payload.email;
            state.name = action.payload.name;
            state.avatar = action.payload.avatar;
        },
        clearUser: (state) => {
            state.id = null;
            state.email = null;
            state.name = null;
            state.avatar = null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;