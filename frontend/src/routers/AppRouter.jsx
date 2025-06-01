import {
  createBrowserRouter,
  Navigate,
  RouterProvider,
} from "react-router-dom";
import HomePage from "../pages/HomePage";
import App from "../App";
import LoginPage from "../pages/LoginPage";
import CadastroPage from "../pages/CadastroPage";
import PoliticaPrivacidadePage from "../pages/PoliticaPrivacidadePage";
import ProtectedRoute from "./ProtectedRoute";
import MinhaAreaLayout from "../layouts/MinhaAreaLayout";
import MeuPerfilPage from "../pages/profile/MeuPerfilPage";
import AlterarSenhaPage from "../pages/profile/AlterarSenhaPage";
import AdminRoute from "./AdminRoute";
import ListarAtividadesAdminPage from "../pages/admin/activities/ListarAtividadesAdminPage";
import CriarEditarAtividadePage from "../pages/admin/activities/CriarEditarAtividadePage";
import MinhasInscricoesPage from "../pages/profile/MinhasInscricoesPage";
import HistoricoAtividadesPage from "../pages/profile/HistoricoAtividadesPage";
import ListarEstudantesPage from "../pages/superadmin/users/ListarEstudantesPage";
import EditarEstudantePage from "../pages/superadmin/users/EditarEstudantePage";
import ListarAdminsPage from "../pages/superadmin/users/ListarAdminsPage";
import CriarEditarAdminPage from "../pages/superadmin/users/CriarEditarAdminPage";
import EsqueciSenhaPage from "../pages/auth/EsqueciSenhaPage";
import ResetarSenhaPage from "../pages/auth/ResetarSenhaPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "cadastro", element: <CadastroPage /> },
      { path: "politica-de-privacidade", element: <PoliticaPrivacidadePage /> },
      { path: "esqueci-senha", element: <EsqueciSenhaPage /> },
      { path: "reset-password/:token", element: <ResetarSenhaPage /> }, 

      // Rotas protegidas
      {
        element: <ProtectedRoute />, 
        children: [
          {
            path: "minha-area",
            element: <MinhaAreaLayout />,
            children: [
              { index: true, element: <Navigate to="perfil" replace /> },
              { path: "perfil", element: <MeuPerfilPage /> },
              { path: "alterar-senha", element: <AlterarSenhaPage /> },
              {
                path: "inscricoes",
                element: <MinhasInscricoesPage />,
              },
              {
                path: "historico",
                element: <HistoricoAtividadesPage />,
              },
              {
                element: <AdminRoute />, // Protege adicionalmente para o papel 'admin'
                children: [
                  {
                    path: "admin/atividades",
                    element: <ListarAtividadesAdminPage />,
                  },
                  {
                    path: "admin/atividades/nova",
                    element: <CriarEditarAtividadePage />,
                  },
                  {
                    path: "admin/atividades/:activityId/editar",
                    element: <CriarEditarAtividadePage />,
                  },
                  {
                    path: "superadmin/usuarios/estudantes",
                    element: <ListarEstudantesPage />, 
                  },
                  {
                    path: "superadmin/usuarios/estudantes/:userId/editar",
                    element: <EditarEstudantePage />,
                  },
                  {
                    path: "superadmin/usuarios/admins", 
                    element: <ListarAdminsPage />, 
                  },
                  {
                    path: "superadmin/usuarios/admins/nova",
                    element: <CriarEditarAdminPage />,
                  },
                  {
                    path: "superadmin/usuarios/admins/:userId/editar",
                    element: <CriarEditarAdminPage />,
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: "*",
    element: <div>404 - Página não encontrada</div>, // Página de erro 404
  },
]);

const AppRouter = () => {
  return <RouterProvider router={router} />;
};

export default AppRouter;