import express, { Request, Response, NextFunction } from "express";
import connectDB from "./dbConnection";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import passport from "./auth/passport";
import authRouter from "./routes/authRoutes";
import gigRoutes from "./routes/gigRoutes";
import userRoutes from "./routes/userRoutes";
import orderRoutes from "./routes/orderRoutes";

dotenv.config();

const app = express();

connectDB();

app.use(cookieParser());

const corsOptions = {
  origin: "https://find-pro-client.vercel.app",
  //origin: "http://localhost:3000",

  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Content-Type",
    "Accept",
    "Authorization",
    "Access-Control-Allow-Credentials",
  ],
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Pre-flight requests
app.options('*', cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(passport.initialize());

// Add the logging middleware here, after other middleware but before routes
app.use((req, res, next) => {
  console.log('Incoming request:');
  console.log('URL:', req.url);
  console.log('Method:', req.method);
  console.log('Headers:', req.headers);
  console.log('Cookies:', req.cookies);
  next();
});

app.use("/auth", authRouter);
app.use("/user", userRoutes);
app.use("/gigs", gigRoutes);
app.use("/order", orderRoutes);

app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(err.stack);
  res.status(500).json({ error: "Internal Server Error While Processing Request" });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});