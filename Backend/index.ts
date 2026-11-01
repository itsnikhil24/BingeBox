import express from "express";
import path from "path";
import videoRoutes from "./routes/video.route";
import authRoutes from "./routes/auth.routes";
import cors from "cors";
import cookieParser from "cookie-parser";
const app=express();
const PORT=process.env.PORT || 3000;


// Cookie auth needs an explicit origin allow-list — browsers reject
// credentialed requests when CORS answers with "*".
const allowedOrigins = (
  process.env.CORS_ORIGINS || "http://localhost:5173,http://localhost"
)
  .split(",")
  .map((origin) => origin.trim());

app.use(cors({ origin: allowedOrigins, credentials: true }));
app.use(cookieParser());

app.use(express.json());
app.use("/videos", express.static(path.join(__dirname, "output")));
app.use("/api/video", videoRoutes);
app.use("/api/auth", authRoutes);

app.get("/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "BingeBox API is healthy",
  });
});

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});