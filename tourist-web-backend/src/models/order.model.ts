import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User", // Referencing the User model
    },
    tourID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "Tour", // Referencing the Tour model
    },
    amount: {
      type: Number,
      required: true,
    },
    status: { // 0 -> Pending, 1 -> Success, 2 -> Failed
      type: Number,
      enum: [0, 1, 2],
      required: true,
    },
    razorpayOrderID: {
      type: String,
    },
    razorpayPaymentID: {
      type: String,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

orderSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};

const Order = mongoose.model("Order", orderSchema);

export default Order;
