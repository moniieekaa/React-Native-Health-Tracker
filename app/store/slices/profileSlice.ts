import { createSlice } from '@reduxjs/toolkit';

interface ProfileState {
  name: string;
  email: string;
  age: number | null;
  gender: string;
  height: number | null;
  weight: number | null;
}

const initialState: ProfileState = {
  name: '',
  email: '',
  age: null,
  gender: '',
  height: null,
  weight: null,
};

const profileSlice = createSlice({
  name: 'profile',
  initialState,
  reducers: {
    setProfile: (state, action) => {
      return { ...state, ...action.payload };
    },
    resetProfile: () => initialState,
  },
});

export const { setProfile, resetProfile } = profileSlice.actions;
export default profileSlice.reducer; 