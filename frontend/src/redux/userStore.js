import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    userData: null,
    project: [],
    projectData: null,
    loading: true,
  },
  reducers: {
    setUserData: (state, action) => {
      state.userData = action.payload;
      state.loading = false;
    },
    setProject: (state, action) => {
      state.project = action.payload;
      state.loading = false;
    },
    setProjectData: (state, action) => {
      state.projectData = action.payload;
      state.loading = false;
    },
  },
});

export const { setUserData ,setProject,setProjectData} = userSlice.actions;
export default userSlice.reducer;
