import express, { Request, Response } from "express";
import cors from "cors";
import UserRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import StaticRouter from "./routes/static.route.js";
import TourRouter from "./routes/tour.route.js";
import PurchasedTourRouter from "./routes/purchasedTour.route.js";
import OrderRouter from "./routes/order.route.js";
import ReviewRouter from "./routes/review.route.js";
import LikeRouter from "./routes/like.route.js";
import DistrictRouter from "./routes/district.route.js";
import PlaceRouter from "./routes/place.route.js";
import ScenicRouter from "./routes/scenic.route.js";

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://qa.indianarrated.com",
    "https://indianarrated.com",
    "https://www.indianarrated.com",
    process.env.FRONTEND_URL, // set this env var to your Vercel URL
  ].filter(Boolean) as string[], // Allow requests from this origin
  credentials: true, // Allow cookies and credentials
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization", "x-admin-token"], // Allowed headers
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());

app.get("/api/v1", (req: Request, res: Response) => {
  res.status(201).json({
    status: 201,
    message: "Hello, World!",
  });
});

app.use("/api/v1/users", UserRouter);
app.use("/api/v1", StaticRouter);
app.use("/api/v1/tours", TourRouter);
app.use("/api/v1/purchased", PurchasedTourRouter);
app.use("/api/v1/orders/", OrderRouter);
app.use("/api/v1/reviews", ReviewRouter);
app.use("/api/v1/likes", LikeRouter);
app.use("/api/v1/districts", DistrictRouter);
app.use("/api/v1/places", PlaceRouter);
app.use("/api/v1/scenics", ScenicRouter);

export default app;
