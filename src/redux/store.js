import { configureStore, createSlice } from '@reduxjs/toolkit';
import questions from '../questions.json';

const testSlice = createSlice({
  name: 'test',
  initialState: { questions, currentIndex: 0, difficulty: 'Medium' },
  reducers: {
    answerQuestion: (state, action) => {
      const correct = action.payload.correct;
      state.difficulty = correct ? 'Hard' : 'Easy';
      state.currentIndex++;
    }
  }
});

export const { answerQuestion } = testSlice.actions;
export default configureStore({ reducer: { test: testSlice.reducer } });