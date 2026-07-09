import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

type ExamsState = { items: any[] };

const examsSlice = createSlice({
    name: 'exams',
    initialState: { items: [] } as ExamsState,
    reducers: {
        setExams(state, action: PayloadAction<any[]>) {
            state.items = action.payload;
        },
    },
});

export const { setExams } = examsSlice.actions;

export const store = configureStore({
    reducer: { exams: examsSlice.reducer },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
