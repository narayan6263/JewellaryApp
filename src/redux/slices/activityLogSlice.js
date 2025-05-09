import { createSlice } from '@reduxjs/toolkit';

const activityLogSlice = createSlice({
    name: 'activityLog',
    initialState: {
        logs: []
    },
    reducers: {
        addActivityLog: (state, action) => {
            console.log('Adding activity log:', action.payload);
            state.logs.unshift({
                id: Date.now(),
                timestamp: new Date().toISOString(),
                ...action.payload
            });
            console.log('Updated logs:', state.logs);
        },
        clearLogs: (state) => {
            state.logs = [];
        }
    }
});

export const { addActivityLog, clearLogs } = activityLogSlice.actions;
export default activityLogSlice.reducer; 