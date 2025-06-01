import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import logoIdv from "../../assets/logo-idv.png"; 

const Header = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login"); 
  };

  return (
    <header className="bg-primary text-primary-foreground p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-xl font-bold font-poppins flex items-center"
        >
          <img src={logoIdv} alt="Logo IDV" className="h-12 mr-2" />{" "}
          {/* Aumentado de h-8 para h-12 */}
          Meninas Digitais UTFPR-CP
        </Link>
        <nav>
          <Link
            to="/"
            className="hover:opacity-80 px-3 py-2 rounded-md text-sm font-medium"
          >
            Home
          </Link>

          {isAuthenticated ? (
            <>
              <Link
                to="/minha-area"
                className="hover:opacity-80 px-3 py-2 rounded-md text-sm font-medium"
              >
                Minha Área ({user?.nomeCompleto?.split(" ")[0]}){" "}
                {/* Exibe o primeiro nome */}
              </Link>
              <button
                onClick={handleLogout}
                className="hover:opacity-80 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sair
              </button>
            </>
          ) : (
            <>
              <Link
                to="/login"
                className="hover:opacity-80 px-3 py-2 rounded-md text-sm font-medium"
              >
                Entrar
              </Link>
              <Link
                to="/cadastro"
                className="bg-accent hover:bg-accent-dark text-accent-foreground px-3 py-2 rounded-md text-sm font-medium ml-2"
              >
                Cadastrar
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;