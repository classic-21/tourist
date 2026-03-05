import mongoose from "mongoose";

const districtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    description: {
      type: mongoose.Schema.Types.Mixed, // { en: "...", hi: "..." }
    },
    imageUrl: {
      type: String,
    },
    amount: {
      type: Number,
      required: true,
    },
    state: {
      type: String,
      default: "Uttar Pradesh",
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

districtSchema.methods.softDelete = function () {
  this.deletedAt = new Date();
  return this.save();
};

const District = mongoose.model("District", districtSchema);

export default District;
