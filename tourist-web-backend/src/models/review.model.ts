import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
  {
    tourID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Tour",
      required: true,
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  { timestamps: true }
);

// One review per user per tour
reviewSchema.index({ tourID: 1, userID: 1 }, { unique: true });

const Review = mongoose.model("Review", reviewSchema);

export default Review;
