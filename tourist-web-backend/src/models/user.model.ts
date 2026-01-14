import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import jwt, { SignOptions } from "jsonwebtoken";
import { UserDTO } from "../types/user.types.js";
import { APIErrors } from "../utils/apiErrors.js";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email address"],
    },
    password: {
      type: String,
      required: true,
      minlength: 8,
    },
    refreshToken: {
      type: String,
    },
  },
  { timestamps: true }
);

userSchema.pre<UserDTO>("save", async function (next): Promise<void> {
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.checkPassword = async function (
  userEnteredPassword: string
): Promise<boolean> {
  if (!userEnteredPassword) return false;

  return await bcrypt.compare(userEnteredPassword, this.password);
};

userSchema.methods.generateToken = function (
  userID: string,
  refreshToken?: boolean
): string {
  // get token secret from env
  let tokenSecret: string | undefined = refreshToken
    ? process.env.REFRESH_TOKEN_SECRET
    : process.env.ACCESS_TOKEN_SECRET;

  // get token expiry time from env
  let timeToExpire: string | undefined = refreshToken
    ? process.env.REFRESH_TOKEN_EXPIRY
    : process.env.ACCESS_TOKEN_EXPIRY;

  // if tokenSecret/timeToExpire cannot be fetched from env then throw error
  if (!tokenSecret || !timeToExpire) {
    throw new APIErrors({
      statusCode: 500,
      message: "Token secret or token expiry not found",
    });
  }

  // sign the token with jwt using userID of the user
  const signedToken = jwt.sign(
    {
      id: userID,
    },
    tokenSecret,
    { expiresIn: timeToExpire } as SignOptions
  );

  return signedToken;
};

const User = mongoose.model<UserDTO>("User", userSchema);

export default User;
