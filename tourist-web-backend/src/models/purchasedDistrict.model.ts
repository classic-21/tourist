import mongoose from "mongoose";

const purchasedDistrictSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    districtID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "District",
    },
    orderID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
  },
  { timestamps: true }
);

purchasedDistrictSchema.index({ districtID: 1, userID: 1 }, { unique: true });

const PurchasedDistrict = mongoose.model("PurchasedDistrict", purchasedDistrictSchema);

export default PurchasedDistrict;
