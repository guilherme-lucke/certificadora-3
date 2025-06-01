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
import AdminRoute from "./AdminRoute";
import ListarAtividadesAdminPage from "../pages/admin/activities/ListarAtividadesAdminPage";
import CriarEditarAtividadePage from "../pages/admin/activities/CriarEditarAtividadePage";
import ListarEstudantesPage from "../pages/superadmin/users/ListarEstudantesPage";
import EditarEstudantePage from "../pages/superadmin/users/EditarEstudantePage";
import ListarAdminsPage from "../pages/superadmin/users/ListarAdminsPage";
import CriarEditarAdminPage from "../pages/superadmin/users/CriarEditarAdminPage";

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "cadastro", element: <CadastroPage /> },
      { path: "politica-de-privacidade", element: <PoliticaPrivacidadePage /> },

      {
        element: <ProtectedRoute />, 
        children: [
          {
            path: "minha-area",
            element: <MinhaAreaLayout />,
            children: [
              { index: true, element: <Navigate to="perfil" replace /> },
              {
                path: "inscricoes",
              },
              {
                element: <AdminRoute />, 
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