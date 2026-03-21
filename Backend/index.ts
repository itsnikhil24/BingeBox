import express from "express";
import path from "path";
import videoRoutes from "./routes/video.route";
import cors from "cors";
const app=express();
const PORT=3000;


app.use(cors());

app.use(express.json());
app.use("/videos", express.static(path.join(__dirname, "output")));
app.use("/api/video", videoRoutes);

app.get("/", (req, res) => {
  res.send("Server is running 🚀");
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});