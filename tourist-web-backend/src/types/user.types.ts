import { Request } from "express";
import { Document } from "mongoose";

export interface AccessAndRefreshTokenDTO {
  accessToken?: string;
  refreshToken?: string;
}

export interface UserDTO extends Document {
  name: string;
  email: string;
  password: string;
  refreshToken: string;
  checkPassword(userEnteredPassword: string): Promise<boolean>;
  generateToken(userID: string, refreshToken?: boolean): string;
}

export interface JWTResDTO {
  id: string;
  iat: number;
  exp: number;
}

export interface GlobalRequestDTO extends Request {
  userID: string;
}
