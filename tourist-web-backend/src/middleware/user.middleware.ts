import { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { GlobalRequestDTO, JWTResDTO } from "../types/user.types.js";

export async function checkJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (process.env.NODE_ENV === "development") {
    const devUserID = process.env.DEV_USER_ID;
    if (!devUserID) {
      res.status(500).json({
        statusCode: 500,
        message: "DEV_USER_ID not set in .env — required when NODE_ENV=development",
      });
      return;
    }
    (req as GlobalRequestDTO).userID = devUserID;
    const devUser = await User.findById(devUserID).select("isTestUser");
    (req as GlobalRequestDTO).isTestUser = devUser?.isTestUser ?? false;
    return next();
  }

  const authorization =
    req?.headers?.["authorization"] || req?.body?.accessToken;

  let accessTokenSecretKey;
  try {
    accessTokenSecretKey = process.env.ACCESS_TOKEN_SECRET as string;

  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      message: "Internal Server Error",
    });
    return;
  }

  const accessToken = authorization?.split(" ")[1];
  let accessTokenDetails: JWTResDTO | null = null;

  try {
    accessTokenDetails = jwt.verify(
      accessToken,
      accessTokenSecretKey
    ) as JWTResDTO;
  } catch (error) {
    console.log(
      "CheckJWT Middleware: Error came while decoding access token or acces token not received."
    );

    res.status(401).json({
      statusCode: 401,
      message: "Unauthorized Access",
    });

    return;
  }

  const userID = accessTokenDetails?.id;
  const userDetails = await User.findById(userID);

  if (!userDetails || Object.keys(userDetails).length === 0) {
    res.status(401).json({
      statusCode: 401,
      message: "Unauthorized Access",
    });
    return;
  }

  (req as GlobalRequestDTO).userID = userID as string;
  (req as GlobalRequestDTO).isTestUser = userDetails?.isTestUser ?? false;

  next();
}

export function checkAdmin(req: Request, res: Response, next: NextFunction) {
  const adminToken = req.headers["x-admin-token"];
  const expectedToken = process.env.ADMIN_SECRET;

  if (!expectedToken) {
    res.status(500).json({ statusCode: 500, message: "Admin secret not configured" });
    return;
  }

  if (!adminToken || adminToken !== expectedToken) {
    res.status(403).json({ statusCode: 403, message: "Admin access required" });
    return;
  }

  next();
}
