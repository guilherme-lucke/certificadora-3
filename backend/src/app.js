import express from "express";
import userRoutes from "./routes/userRoutes.js";
import authRoutes from "./routes/authRoutes.js";

const app = express();

app.use(express.json());
app.use(userRoutes);
app.use(authRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

export default app;
