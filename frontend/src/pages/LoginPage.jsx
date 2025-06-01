import React, { useState, useEffect } from "react"; 
import { Link, useNavigate, useLocation } from "react-router-dom";
// import authService from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation(); // Obtenha a localização
  const { login } = useAuth(); // Use o hook

  useEffect(() => {
    window.scrollTo(0, 0); // Adiciona o scroll para o topo ao montar o componente
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }));
  };

  const from = location.state?.from?.pathname || "/minha-area"; // Caminho para redirecionar ou padrão

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError("E-mail e senha são obrigatórios.");
      setIsLoading(false);
      return;
    }

    try {
      const response = await login(formData);
      setIsLoading(false);
      console.log("Login bem-sucedido (via AuthContext):", response);
      navigate(from, { replace: true }); 
    } catch (apiError) {
      setIsLoading(false);
      console.error("Erro no login (LoginPage):", apiError);
      if (apiError && apiError.error && apiError.error.message) {
        setError(apiError.error.message);
      } else {
        setError(
          "Falha no login. Verifique suas credenciais ou tente novamente mais tarde."
        );
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-bg-default p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold font-poppins text-text-default">
            Acesse sua conta
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <input type="hidden" name="remember" defaultValue="true" />
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">
                E-mail
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-text-muted text-text-default rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Seu e-mail"
                value={formData.email}
                onChange={handleChange}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Senha
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-text-muted text-text-default rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                placeholder="Sua senha"
                value={formData.password}
                onChange={handleChange}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                to="/esqueci-senha" 
                className="font-medium text-primary hover:text-primary-dark"
              >
                Esqueceu sua senha?
              </Link>
            </div>
          </div>

          {error && <p className="text-error text-sm text-center">{error}</p>}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
        </form>
        <p className="mt-4 text-center text-sm text-text-muted">
          Não tem uma conta?{" "}
          <Link
            to="/cadastro"
            className="font-medium text-primary hover:text-primary-dark"
          >
            Cadastre-se
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;