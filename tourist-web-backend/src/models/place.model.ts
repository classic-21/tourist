import mongoose from "mongoose";

const placeSchema = new mongoose.Schema(
  {
    districtID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "District",
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
    amount: {
      type: Number,
      default: 0,
    },
    order: {
      type: Number,
      default: 0,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

const Place = mongoose.model("Place", placeSchema);

export default Place;
