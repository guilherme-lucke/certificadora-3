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

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "login", element: <LoginPage /> },
      { path: "cadastro", element: <CadastroPage /> },
      { path: "politica-de-privacidade", element: <PoliticaPrivacidadePage /> },
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