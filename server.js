import express from "express";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import { loadModels } from "./utils/faceUtils.js";
import authRoutes from "./routes/authRoutes.js";
import cors from "cors";

dotenv.config();
const app = express();

app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.urlencoded({ extended: true }));
app.use("/api/auth", authRoutes);
app.get("/", (req, res) => {
  res.send("Welcome to the Face Authentication API");
});
const startServer = async () => {
  await connectDB();
  await loadModels();
  app.listen(5000, () => console.log("🚀 Server running on port 5000"));
};

startServer();
