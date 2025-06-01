import React, { useState } from "react";
import { Link } from "react-router-dom";
import authService from "../../services/authService"; 
import Input from "../../components/common/Input"; 


const EsqueciSenhaPage = () => {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(""); // Para mensagens de sucesso ou erro da API
  const [formError, setFormError] = useState(""); // Para erro de validação do formulário

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (formError) setFormError(""); // Limpa erro de formulário ao digitar
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setFormError("");

    if (!email.trim()) {
      setFormError("O campo e-mail é obrigatório.");
      return;
    }
    // Validação simples de formato de e-mail no cliente (opcional, backend também valida)
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setFormError("Por favor, insira um endereço de e-mail válido.");
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.forgotPassword(email);
      // A API deve retornar uma mensagem genérica de sucesso
      // ex: { success: true, message: "Se um usuário..." }
      if (response.success) {
        setMessage(
          response.message ||
            "Instruções para redefinição de senha foram enviadas, se o e-mail estiver cadastrado."
        );
        // toast.success(response.message || "Instruções enviadas!");
        setEmail(""); // Limpa o campo após o envio bem-sucedido
      } else {
        // Caso o backend retorne success: false com uma mensagem específica
        setMessage(
          response.error?.message || "Ocorreu um erro. Tente novamente."
        );
        // toast.error(response.error?.message || "Ocorreu um erro.");
      }
    } catch (err) {
      console.error("Erro ao solicitar redefinição de senha:", err);
      // A mensagem genérica já é retornada pela API em caso de sucesso (para não revelar e-mails)
      // Se houver um erro de rede ou um erro inesperado, mostre uma mensagem genérica.
      setMessage(
        err.message ||
          "Falha ao processar sua solicitação. Tente novamente mais tarde."
      );
      // toast.error(err.message || "Falha ao processar sua solicitação.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-bg-default p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold font-poppins text-text-default">
            Esqueceu sua senha?
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            Não se preocupe! Insira seu e-mail abaixo e enviaremos um link para
            você criar uma nova senha.
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            id="email"
            name="email"
            label="Seu endereço de e-mail"
            type="email"
            value={email}
            onChange={handleChange}
            placeholder="email@exemplo.com"
            required
            error={formError} // Exibe erro de validação do formulário
          />

          {message && ( // Exibe mensagem de sucesso ou erro da API
            <p
              className={`text-sm p-3 rounded-md ${
                message.toLowerCase().includes("enviad") ||
                message.toLowerCase().includes("sucesso") // Heurística para sucesso
                  ? "bg-green-100 text-green-700" // Usando text-green-700 para sucesso
                  : "bg-red-100 text-error" // Usando text-error para erro
              }`}
            >
              {message}
            </p>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isLoading ? "Enviando..." : "Enviar Link de Redefinição"}
            </button>
          </div>
        </form>
        <div className="text-sm text-center">
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-dark"
          >
            Lembrou a senha? Voltar para o Login
          </Link>
        </div>
      </div>
    </div>
  );
};

export default EsqueciSenhaPage;