// import { createSlice } from "@reduxjs/toolkit";
// import type { PayloadAction } from "@reduxjs/toolkit";

// export interface LikedState {
//   data: Array<number>;
// }

// const initialState: LikedState = {
//   data: [],
// };

// export const LikeSlice = createSlice({
//   name: "counter",
//   initialState,
//   reducers: {
//     likedTour: (state, action: PayloadAction<number>) => {
//       if (!state.data.includes(action.payload)) {
//         state.data.push(action.payload);
//       }
//     },
//     removeLikedTour: (state, action: PayloadAction<number>) => {
//       if (state.data.includes(action.payload)) {
//         state.data.push(action.payload);
//       }
//     },
//   },
// });

// // Action creators are generated for each case reducer function
// export const { likedTour, removeLikedTour } = LikeSlice.actions;

// export default LikeSlice.reducer;
