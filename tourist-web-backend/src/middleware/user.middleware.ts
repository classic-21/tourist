import { NextFunction, Request, Response } from "express";
import User from "../models/user.model.js";
import jwt from "jsonwebtoken";
import { GlobalRequestDTO, JWTResDTO } from "../types/user.types.js";

export async function checkJWT(
  req: Request,
  res: Response,
  next: NextFunction
) {
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

  if (!userDetails || !userDetails || Object.keys(userDetails)?.length === 0) {
    res.status(401).json({
      statusCode: 401,
      message: "Unauthorized Access",
    });
    return;
  }

  (req as GlobalRequestDTO).userID = userID as string;

  next();
}
