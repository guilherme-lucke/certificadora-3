import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import superAdminUserService from "../../../services/superAdminUserService";
import Input from "../../../components/common/Input";

const CriarEditarAdminPage = () => {
  const { userId } = useParams(); // 'userId' para consistência, mesmo sendo adminId
  const navigate = useNavigate();
  const isEditing = Boolean(userId);

  const [formData, setFormData] = useState({
    nomeCompleto: "",
    email: "",
    password: "", // Apenas para criação
    confirmPassword: "", // Apenas para criação
    telefone: "",
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const pageTitle = isEditing
    ? "Editar Administrador"
    : "Criar Novo Administrador";

  // TODO: useEffect (para buscar dados se isEditing)
  // Dentro de CriarEditarAdminPage.jsx
  useEffect(() => {
    if (isEditing && userId) {
      const fetchAdminData = async () => {
        setIsLoading(true);
        setApiError("");
        try {
          // Assumindo que getAdmins() retorna todos os campos necessários, ou crie getAdminById()
          // Para simplicidade, vamos assumir que o GET /superadmin/users/admins já traz o suficiente
          // ou que você implementará getAdminById no serviço.
          // Se não tiver getAdminById, você pode filtrar da lista de admins (menos ideal)
          // ou o backend PUT /superadmin/users/admins/:userId deve retornar o objeto completo.
          // Vamos simular a busca por ID, mesmo que a API não liste explicitamente GET /admins/:id
          const data = await superAdminUserService.getAdminById(userId); // CRIE ESTA FUNÇÃO NO SERVIÇO
          setFormData({
            nomeCompleto: data.nomeCompleto || "",
            email: data.email || "", // Exibir, mas não permitir edição se não for suportado pela API
            telefone: data.telefone || "",
            isActive: data.isActive === undefined ? true : data.isActive,
            password: "", // Senha não é preenchida na edição
            confirmPassword: "",
          });
        } catch (err) {
          setApiError(err.message || "Falha ao carregar dados do admin.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchAdminData();
    } else {
      // Modo de criação
      setFormData({
        nomeCompleto: "",
        email: "",
        password: "",
        confirmPassword: "",
        telefone: "",
        isActive: true,
      });
      setIsLoading(false);
    }
  }, [isEditing, userId]); // TODO: handleChange
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };

  // TODO: handleSubmit

  // Dentro de CriarEditarAdminPage.jsx
  const validateForm = () => {
    const errors = {};
    if (!formData.nomeCompleto.trim())
      errors.nomeCompleto = "Nome é obrigatório.";
    if (!formData.email.trim()) errors.email = "Email é obrigatório.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      errors.email = "Email inválido.";

    if (!isEditing) {
      // Validações de senha apenas na criação
      if (!formData.password) errors.password = "Senha é obrigatória.";
      else if (formData.password.length < 6)
        errors.password = "Senha deve ter no mínimo 6 caracteres.";
      if (formData.password !== formData.confirmPassword)
        errors.confirmPassword = "As senhas não coincidem.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");
    const validationErrors = validateForm();
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).some((key) => validationErrors[key]))
      return;

    setIsLoading(true);
    try {
      let response;
      const payload = { ...formData };
      if (isEditing) {
        delete payload.password; // Não envia senha na edição
        delete payload.confirmPassword;
        delete payload.email; // Email não é editável via este form
        response = await superAdminUserService.updateAdmin(userId, payload);
      } else {
        delete payload.confirmPassword; // Não envia confirmPassword para a API
        response = await superAdminUserService.createAdmin(payload);
      }

      if (response.success) {
        alert(
          response.message ||
            (isEditing ? "Admin atualizado!" : "Admin criado!")
        );
        navigate("/minha-area/superadmin/usuarios/admins");
      } else {
        setApiError(response.error?.message || "Ocorreu um erro.");
      }
    } catch (err) {
      setApiError(err.message || "Falha ao salvar dados do admin.");
    } finally {
      setIsLoading(false);
    }
  };
  // TODO: JSX do formulário

  if (isLoading && isEditing)
    return <p>Carregando dados do administrador...</p>;
  // ...
  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
        {pageTitle}
      </h1>
      {apiError && (
        <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{apiError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Nome Completo"
          name="nomeCompleto"
          value={formData.nomeCompleto}
          onChange={handleChange}
          error={formErrors.nomeCompleto}
          required
        />
        <Input
          label="Email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          error={formErrors.email}
          required
          disabled={isEditing}
          className={isEditing ? "bg-gray-100" : ""}
        />
        <Input
          label="Telefone"
          name="telefone"
          type="tel"
          value={formData.telefone}
          onChange={handleChange}
          error={formErrors.telefone}
        />

        {!isEditing && (
          <>
            <Input
              label="Senha"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              error={formErrors.password}
              required={!isEditing}
            />
            <Input
              label="Confirmar Senha"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              error={formErrors.confirmPassword}
              required={!isEditing}
            />
          </>
        )}

        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            className="h-4 w-4 text-brandPurple-600 border-gray-300 rounded focus:ring-brandPurple-500"
          />
          <label
            htmlFor="isActive"
            className="ml-2 block text-sm text-gray-900"
          >
            Conta Ativa
          </label>
        </div>

        <div className="flex items-center justify-end space-x-3 pt-6 border-t mt-6">
          <button
            type="button"
            onClick={() => navigate("/minha-area/superadmin/usuarios/admins")}
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-brandPurple-700 text-white rounded-md hover:bg-brandPurple-800 disabled:opacity-50"
          >
            {isLoading
              ? isEditing
                ? "Salvando..."
                : "Criando..."
              : isEditing
              ? "Salvar Alterações"
              : "Criar Admin"}
          </button>
        </div>
      </form>
    </div>
  );
};
export default CriarEditarAdminPage;
