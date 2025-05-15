import express from "express";
import userRoutes from "./routes/userRoutes.js";

const app = express();

app.use(express.json());
app.use(userRoutes);

app.get("/", (req, res) => {
  res.send("Welcome to the API");
});

export default app;
