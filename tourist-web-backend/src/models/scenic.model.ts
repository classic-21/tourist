import mongoose from "mongoose";

const scenicSchema = new mongoose.Schema(
  {
    placeID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Place",
    },
    name: {
      type: String,
      required: true,
    },
    description: {
      type: mongoose.Schema.Types.Mixed, // { en: "...", hi: "..." }
    },
    imageUrl: {
      type: String,
    },
    order: {
      type: Number,
      default: 0,
    },
    audios: [
      {
        language: { type: String, required: true },
        s3Key: { type: String, required: true },
      },
    ],
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Scenic = mongoose.model("Scenic", scenicSchema);

export default Scenic;
