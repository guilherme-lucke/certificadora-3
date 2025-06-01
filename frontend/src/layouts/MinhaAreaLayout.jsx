// frontend/src/layouts/MinhaAreaLayout.jsx
import React from "react";
import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const MinhaAreaLayout = () => {
  const { user } = useAuth(); // user.role estará disponível aqui

  const navLinkClasses = ({ isActive }) =>
    `block px-4 py-2 rounded-md text-sm font-medium ${
      isActive
        ? "bg-brandPurple-100 text-brandPurple-700"
        : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
    }`;

  const subNavLinkClasses = (
    { isActive } // Classes para sub-menu
  ) =>
    `block pl-8 pr-4 py-2 rounded-md text-sm ${
      // Adicionado pl-8 para indentação
      isActive
        ? "bg-brandPurple-50 text-brandPurple-600 font-medium"
        : "text-gray-600 hover:bg-gray-50 hover:text-gray-800"
    }`;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">
        Minha Área{" "}
        {user?.nomeCompleto && `- ${user.nomeCompleto.split(" ")[0]}`}
      </h1>
      <div className="lg:flex lg:space-x-8">
        <aside className="lg:w-1/4 mb-6 lg:mb-0">
          <nav className="space-y-1 bg-white p-4 rounded-lg shadow">
            {/* Links Comuns / Estudante */}
            <NavLink to="/minha-area/perfil" className={navLinkClasses} end>
              Meu Perfil
            </NavLink>
            <NavLink to="/minha-area/alterar-senha" className={navLinkClasses}>
              Alterar Senha
            </NavLink>
            {/* Visível para estudantes */}
            {user?.role === "estudante" && (
              <>
                <NavLink to="/minha-area/inscricoes" className={navLinkClasses}>
                  Minhas Inscrições
                </NavLink>
                <NavLink to="/minha-area/historico" className={navLinkClasses}>
                  Histórico de Atividades
                </NavLink>
              </>
            )}

            {/* Links de ADMIN */}
            {(user?.role === "admin" || user?.role === "superadmin") && (
              <>
                <div className="pt-4 mt-4 border-t border-gray-200">
                  <h3 className="px-3 text-xs font-semibold uppercase text-gray-500 tracking-wider mb-2">
                    Administração
                  </h3>
                </div>{" "}
                <NavLink
                  to="/minha-area/admin/atividades"
                  className={subNavLinkClasses}
                >
                  Gerenciar Atividades
                </NavLink>
              </>
            )}

            {/* Links de SUPERADMIN */}
            {user?.role === "superadmin" && (
              <>
                <NavLink
                  to="/minha-area/superadmin/usuarios/estudantes"
                  className={subNavLinkClasses} // Ou subNavLinkClasses se quiser indentar
                >
                  Gerenciar Estudantes
                </NavLink>
                <NavLink
                  to="/minha-area/superadmin/usuarios/admins"
                  className={subNavLinkClasses} // Ou subNavLinkClasses
                >
                  Gerenciar Admins
                </NavLink>
                {/* Adicionar mais links de superadmin aqui no futuro, ex: Logs */}
              </>
            )}
          </nav>
        </aside>
        <main className="lg:w-3/4 bg-white p-6 rounded-lg shadow">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MinhaAreaLayout;
