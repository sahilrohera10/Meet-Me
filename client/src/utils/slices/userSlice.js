import { createSlice } from "@reduxjs/toolkit";

const user = createSlice({
    name: "user",
    initialState: {
        profile:[]
    },
    reducers:{
        addprofile:(state , action)=>{
          state.profile.push(action.payload);
        }
    }
});
export const {addprofile}  = user.actions;

export default user.reducer;
