require("dotenv").config();
const express = require("express");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const cors = require("cors");
const activityAdminRoutes = require("./routes/activityAdminRoutes");
const activityPublicRoutes = require("./routes/activityPublicRoutes");
const inscriptionRoutes = require("./routes/inscriptionRoutes");
const superAdminUserRoutes = require("./routes/superAdminUserRoutes");
const helmet = require("helmet");

const app = express();
app.use(helmet());

// Middleware CORS
app.use(cors());

// Connect to MongoDB
connectDB();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Routes Test
app.get("/", (req, res) => {
  res.send("API do Meninas Digitais UTFPR-CP está rodando!");
});

// Rotas da Aplicação
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/admin/activities", activityAdminRoutes);
app.use("/api/v1/public/activities", activityPublicRoutes);
app.use("/api/v1/inscriptions", inscriptionRoutes);
app.use("/api/v1/superadmin/users", superAdminUserRoutes);

const PORT = process.env.PORT || 3333;
app.listen(PORT, () => {
  console.log(`Servidor backend rodando na porta ${PORT}`);
});
