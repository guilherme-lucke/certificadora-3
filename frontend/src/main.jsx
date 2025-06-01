import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/index.css";
import AppRouter from "./routers/AppRouter.jsx";
import { AuthProvider } from "./contexts/AuthContext";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </StrictMode>
);