import mongoose from "mongoose";

const likeSchema = new mongoose.Schema(
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
  },
  { timestamps: true }
);

// One like per user per tour
likeSchema.index({ tourID: 1, userID: 1 }, { unique: true });

const Like = mongoose.model("Like", likeSchema);

export default Like;
