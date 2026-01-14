import express, { Request, Response } from "express";
import cors from "cors";
import UserRouter from "./routes/user.route.js";
import cookieParser from "cookie-parser";
import StaticRouter from "./routes/static.route.js";
import TourRouter from "./routes/tour.route.js";
import PurchasedTourRouter from "./routes/purchasedTour.route.js";
import OrderRouter from "./routes/order.route.js";

const app = express();

const corsOptions = {
  origin: [
    "http://localhost:3000",
    "https://qa.indianarrated.com",
    "https://indianarrated.com",
    "https://www.indianarrated.com",
  ], // Allow requests from this origin
  credentials: true, // Allow cookies and credentials
  methods: ["GET", "POST", "PUT", "DELETE"], // Allowed HTTP methods
  allowedHeaders: ["Content-Type", "Authorization"], // Allowed headers
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

export default app;
