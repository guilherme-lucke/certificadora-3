import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import authService from "../../services/authService";
import Input from "../../components/common/Input";

const ResetarSenhaPage = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [formErrors, setFormErrors] = useState({});

  const validateForm = () => {
    const errors = {};
    if (!newPassword) {
      errors.newPassword = "Nova senha é obrigatória.";
    } else if (newPassword.length < 8) {
      errors.newPassword = "A nova senha deve ter pelo menos 8 caracteres.";
    }
    // Adicionar mais validações de senha se necessário (ex: regex para complexidade)

    if (!confirmPassword) {
      errors.confirmPassword = "Confirmação de senha é obrigatória.";
    } else if (newPassword !== confirmPassword) {
      errors.confirmPassword = "As senhas não coincidem.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "newPassword") setNewPassword(value);
    if (name === "confirmPassword") setConfirmPassword(value);
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" }));
    }
    setMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.resetPassword(token, newPassword);
      if (response.success) {
        setMessage(
          response.message ||
            "Senha redefinida com sucesso! Você já pode fazer login."
        );
        setNewPassword("");
        setConfirmPassword("");
        setTimeout(() => {
          navigate("/login");
        }, 3000); // Redireciona para login após 3 segundos
      } else {
        setMessage(
          response.error?.message ||
            "Falha ao redefinir senha. Tente novamente."
        );
      }
    } catch (err) {
      console.error("Erro ao redefinir senha:", err);
      setMessage(
        err.message || "Ocorreu um erro inesperado. Tente novamente mais tarde."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Redefinir Senha
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            id="newPassword"
            name="newPassword"
            label="Nova Senha"
            type="password"
            value={newPassword}
            onChange={handleChange}
            placeholder="********"
            required
            error={formErrors.newPassword}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar Nova Senha"
            type="password"
            value={confirmPassword}
            onChange={handleChange}
            placeholder="********"
            required
            error={formErrors.confirmPassword}
          />

          {message && (
            <p
              className={`text-sm p-3 rounded-md ${
                message.toLowerCase().includes("sucesso")
                  ? "bg-green-50 text-green-700"
                  : "bg-red-50 text-red-700"
              }`}
            >
              {message}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              {isLoading ? "Redefinindo..." : "Redefinir Senha"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link
            to="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetarSenhaPage;