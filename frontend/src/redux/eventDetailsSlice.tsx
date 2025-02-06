// src\redux\eventDetailsSlice.tsx
import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Events } from '../types'; // Import your Events type

interface EventDetailsState {
    eventDetails: Events | null;
    loading: boolean;
    error: string | null;
}

const initialState: EventDetailsState = {
    eventDetails: null,
    loading: false,
    error: null,
};

const eventDetailsSlice = createSlice({
    name: 'eventDetails',
    initialState,
    reducers: {
        setEventDetails: (state, action: PayloadAction<Events>) => {
            state.eventDetails = action.payload;
            state.loading = false;
            state.error = null;
        },
        fetchEventDetailsStart: (state) => {
            state.loading = true;
            state.error = null;
        },
        fetchEventDetailsFailure: (state, action: PayloadAction<string>) => {
            state.loading = false;
            state.error = action.payload;
            state.eventDetails = null;
        },
        clearEventDetails: (state) => {
            state.eventDetails = null;
            state.loading = false;
            state.error = null;
        },
    },
});

export const {
    setEventDetails,
    fetchEventDetailsStart,
    fetchEventDetailsFailure,
    clearEventDetails,
} = eventDetailsSlice.actions;

export default eventDetailsSlice.reducer;