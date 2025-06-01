import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Input from "../components/common/Input";
import { validateEmail, validatePassword, validateRequired } from "../utils/validators";
//import authService from "../services/authService";
import { useAuth } from "../contexts/AuthContext";

const CadastroPage = () => {
  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    password: "",
    confirmPassword: "",
    telefone: "",
    dataNascimento: "",
    escola: "",
    serieAno: "",
    interesses: "", 
    aceitouPoliticaPrivacidade: false,
  });

  const [errors, setErrors] = useState({}); 
  const navigate = useNavigate(); 

  useEffect(() => {
    window.scrollTo(0, 0); 
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const [isLoading, setIsLoading] = useState(false); 
  const { signup } = useAuth();

  const handleSubmit = async (e) => {
    // Marcar como async
    e.preventDefault();
    setErrors({}); 
    setIsLoading(true); 

    const newErrors = {};

    // Validações
    newErrors.nomeCompleto = validateRequired(
      formData.nomeCompleto,
      "Nome Completo"
    );
    newErrors.email = validateEmail(formData.email);
    newErrors.password = validatePassword(formData.password);
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "As senhas não coincidem.";
    } else {
      newErrors.confirmPassword = validateRequired(
        formData.confirmPassword,
        "Confirmação de Senha"
      );
    }
    newErrors.telefone = validateRequired(formData.telefone, "Telefone");
    newErrors.dataNascimento = validateRequired(
      formData.dataNascimento,
      "Data de Nascimento"
    );
    newErrors.escola = validateRequired(formData.escola, "Escola");
    newErrors.serieAno = validateRequired(formData.serieAno, "Série/Ano");

    if (!formData.aceitouPoliticaPrivacidade) {
      newErrors.aceitouPoliticaPrivacidade =
        "Você deve aceitar a Política de Privacidade para continuar.";
    }

    setErrors(newErrors);

    const hasErrors = Object.values(newErrors).some(
      (errorMsg) => errorMsg !== ""
    );
    if (hasErrors) {
      setIsLoading(false); // Desativar feedback de carregamento
      console.log("Erros de validação:", newErrors);
      return;
    }

    try {
      setIsLoading(true);
      const response = await signup(formData); // Usa a função signup do contexto
      setIsLoading(false);

      console.log(
        "Cadastro e login automático bem-sucedidos (via AuthContext):",
        response
      );
      // O AuthContext já logou o usuário.
      navigate("/minha-area");
    } catch (error) {
      setIsLoading(false);
      console.error("Erro no cadastro (API):", error);
      if (error && error.error && error.error.details) {

        const backendErrors = {};
        for (const key in error.error.details) {
          backendErrors[key] = error.error.details[key];
        }
        setErrors((prevErrors) => ({
          ...prevErrors,
          ...backendErrors,
          api: error.error.message || "Erro ao cadastrar.",
        }));
      } else if (error && error.error && error.error.message) {
        setErrors((prevErrors) => ({
          ...prevErrors,
          api: error.error.message,
        }));
      } else {
        setErrors((prevErrors) => ({
          ...prevErrors,
          api: "Ocorreu um erro desconhecido. Tente novamente.",
        }));
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-bg-default p-10 rounded-xl shadow-lg">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold font-poppins text-text-default">
            Crie sua conta
          </h2>
          <p className="mt-2 text-center text-sm text-text-muted">
            Junte-se ao Meninas Digitais UTFPR-CP!
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <Input
            id="nomeCompleto"
            name="nomeCompleto"
            label="Nome Completo"
            type="text"
            value={formData.nomeCompleto}
            onChange={handleChange}
            placeholder="Digite seu nome completo"
            required
            error={errors.nomeCompleto}
          />
          <Input
            id="email"
            name="email"
            label="E-mail"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Digite seu e-mail"
            required
            error={errors.email}
          />
          <Input
            id="password"
            name="password"
            label="Senha"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Digite sua senha"
            required
            error={errors.password}
          />
          <Input
            id="confirmPassword"
            name="confirmPassword"
            label="Confirmar Senha"
            type="password"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="Confirme sua senha"
            required
            error={errors.confirmPassword}
          />
          <Input
            id="telefone"
            name="telefone"
            label="Telefone"
            type="tel"
            value={formData.telefone}
            onChange={handleChange}
            placeholder="Digite seu telefone"
            required
            error={errors.telefone}
          />
          <Input
            id="dataNascimento"
            name="dataNascimento"
            label="Data de Nascimento"
            type="date"
            value={formData.dataNascimento}
            onChange={handleChange}
            required
            error={errors.dataNascimento}
          />
          <Input
            id="escola"
            name="escola"
            label="Escola"
            type="text"
            value={formData.escola}
            onChange={handleChange}
            placeholder="Digite o nome da sua escola"
            required
            error={errors.escola}
          />
          <Input
            id="serieAno"
            name="serieAno"
            label="Série/Ano"
            type="text"
            value={formData.serieAno}
            onChange={handleChange}
            placeholder="Digite sua série ou ano escolar"
            required
            error={errors.serieAno}
          />
          <Input
            id="interesses"
            name="interesses"
            label="Interesses"
            type="text"
            value={formData.interesses}
            onChange={handleChange}
            placeholder="Quais são seus interesses? (ex: programação, design, etc.)"
            required
            error={errors.interesses}
          />

          {/* Checkbox de Consentimento */}
          <div className="flex items-start">
            <div className="flex items-center h-5">
              <input
                id="aceitouPoliticaPrivacidade"
                name="aceitouPoliticaPrivacidade"
                type="checkbox"
                className="focus:ring-primary h-4 w-4 text-primary border-gray-300 rounded"
                checked={formData.aceitouPoliticaPrivacidade}
                onChange={handleChange}
              />
            </div>
            <div className="ml-3 text-sm">
              <label
                htmlFor="aceitouPoliticaPrivacidade"
                className="font-medium text-text-default"
              >
                Li e concordo com a{" "}
                <Link
                  to="/politica-de-privacidade"
                  target="_blank"
                  className="font-medium text-primary hover:text-primary-dark"
                >
                  Política de Privacidade
                </Link>
                .
              </label>
              {/* errors.aceitouPoliticaPrivacidade && <p className="text-error text-xs mt-1">{errors.aceitouPoliticaPrivacidade}</p> */}
              {errors.aceitouPoliticaPrivacidade && (
                <p className="text-error text-xs mt-1">
                  {errors.aceitouPoliticaPrivacidade}
                </p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading} // Desabilitar enquanto carrega
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-primary-foreground bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
            >
              {isLoading ? "Cadastrando..." : "Cadastrar"}
            </button>
          </div>
          {errors.api && (
            <p className="text-error text-sm text-center mt-4">{errors.api}</p>
          )}
        </form>
        <p className="mt-4 text-center text-sm text-text-muted">
          {" "}
          Já tem uma conta?{" "}
          <Link
            to="/login"
            className="font-medium text-primary hover:text-primary-dark"
          >
            Faça login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default CadastroPage;