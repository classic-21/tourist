import mongoose from "mongoose";

const purchasedPlaceSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    placeID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Place",
    },
    orderID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
  },
  { timestamps: true }
);

purchasedPlaceSchema.index({ placeID: 1, userID: 1 }, { unique: true });

const PurchasedPlace = mongoose.model("PurchasedPlace", purchasedPlaceSchema);

export default PurchasedPlace;
