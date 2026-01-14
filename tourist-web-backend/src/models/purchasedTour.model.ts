import mongoose from "mongoose";

const purchasedTourSchema = new mongoose.Schema(
  {
    orderID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Order",
    },
    tourID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Tour", // Referencing the Tour model
    },
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Referencing the User model
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// Creating a unique compound index for tourID + userID
purchasedTourSchema.index({ tourID: 1, userID: 1 }, { unique: true });

const PurchasedTour = mongoose.model("PurchasedTour", purchasedTourSchema);

export default PurchasedTour;
