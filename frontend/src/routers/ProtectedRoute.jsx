// frontend/src/components/auth/ProtectedRoute.jsx
import React from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext"; // Ajuste o caminho se necessário

const ProtectedRoute = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation(); // Para redirecionar de volta após o login

  if (isLoading) {
    // Se estiver carregando o estado de autenticação, pode mostrar um loader
    // ou simplesmente não renderizar nada até que o estado seja definido.
    // Para simplicidade, vamos não renderizar nada (ou um loader simples).
    return <div>Carregando...</div>; // Ou null, ou um componente Spinner
  }

  if (!isAuthenticated) {
    // Usuário não está logado, redireciona para a página de login.
    // Passa a localização atual para que possa ser redirecionado de volta
    // após o login bem-sucedido.
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Usuário está logado, renderiza o conteúdo da rota (componente filho).
  // Usar <Outlet /> é comum se este ProtectedRoute for usado como um elemento de layout
  // para rotas aninhadas protegidas. Se for para uma única rota, pode-se passar `children`.
  // Para este caso, vamos assumir que ele envolve rotas que usam <Outlet /> ou é usado diretamente.
  return <Outlet />; // Ou {children} se você passar o componente como children
};

export default ProtectedRoute;
