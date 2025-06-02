import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const AdminRoute = () => {
  const { isAuthenticated, user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return <div>Carregando...</div>; // Ou um spinner
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (user.role !== "admin" && user.role !== "superadmin") {
    // Permite superadmin também
    // Usuário está logado, mas não é admin. Pode redirecionar para uma página de "Acesso Negado"
    // ou para a página inicial da "Minha Área" do estudante.
    console.warn(
      "Tentativa de acesso não autorizado à rota de admin por:",
      user.email
    );
    return <Navigate to="/minha-area/perfil" replace />; // Ou uma página /acesso-negado
  }

  // Usuário é admin (ou superadmin), renderiza o conteúdo.
  return <Outlet />;
};

export default AdminRoute;
