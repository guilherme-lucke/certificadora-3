import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import superAdminUserService from "../../../services/superAdminUserService";
import Input from "../../../components/common/Input"; // Reutilizar

const EditarEstudantePage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [studentData, setStudentData] = useState({
    nomeCompleto: "",
    email: "", // Email geralmente não é editável
    telefone: "",
    escola: "",
    serieAno: "",
    interesses: "", // Manter como string separada por vírgulas
    isActive: true,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [formErrors, setFormErrors] = useState({});
  const [apiError, setApiError] = useState("");

  // TODO: useEffect para buscar dados do estudante
  useEffect(() => {
    if (userId) {
      const fetchStudent = async () => {
        setIsLoading(true);
        setApiError("");
        try {
          const data = await superAdminUserService.getStudentById(userId);
          setStudentData({
            nomeCompleto: data.nomeCompleto || "",
            email: data.email || "", // Exibir, mas não permitir edição
            telefone: data.telefone || "",
            escola: data.escola || "",
            serieAno: data.serieAno || "",
            interesses: Array.isArray(data.interesses)
              ? data.interesses.join(", ")
              : data.interesses || "",
            isActive: data.isActive === undefined ? true : data.isActive, // Default para true se não vier
          });
        } catch (err) {
          setApiError(err.message || "Falha ao carregar dados do estudante.");
        } finally {
          setIsLoading(false);
        }
      };
      fetchStudent();
    }
  }, [userId]);
  // TODO: handleChange
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setStudentData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: "" }));
  };
  // TODO: handleSubmit
  const validateForm = () => {
    const errors = {};
    if (!studentData.nomeCompleto.trim())
      errors.nomeCompleto = "Nome completo é obrigatório.";
    // Adicionar mais validações conforme necessário
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
      const dataToUpdate = {
        ...studentData,
        interesses: studentData.interesses
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      };
      delete dataToUpdate.email; // Garante que o email não seja enviado para atualização

      const response = await superAdminUserService.updateStudent(
        userId,
        dataToUpdate
      );
      if (response.success) {
        // toast.success("Dados do estudante atualizados com sucesso!");
        alert("Dados do estudante atualizados com sucesso!");
        navigate("/minha-area/superadmin/usuarios/estudantes");
      } else {
        setApiError(response.error?.message || "Erro ao atualizar estudante.");
      }
    } catch (err) {
      setApiError(err.message || "Falha ao atualizar dados do estudante.");
    } finally {
      setIsLoading(false);
    }
  };
  // TODO: JSX do formulário

  if (isLoading) return <p>Carregando dados do estudante...</p>;
  if (apiError && !studentData.nomeCompleto)
    return <p className="text-red-500">Erro: {apiError}</p>; // Se falhou em carregar

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
        Editar Estudante: {studentData.nomeCompleto || "Carregando..."}
      </h1>
      {apiError && (
        <p className="text-red-500 bg-red-100 p-3 rounded mb-4">{apiError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Nome Completo"
          name="nomeCompleto"
          value={studentData.nomeCompleto}
          onChange={handleChange}
          error={formErrors.nomeCompleto}
          required
        />
        <Input
          label="Email (não editável)"
          name="email"
          value={studentData.email}
          readOnly
          disabled
          className="bg-gray-100"
        />
        <Input
          label="Telefone"
          name="telefone"
          type="tel"
          value={studentData.telefone}
          onChange={handleChange}
          error={formErrors.telefone}
        />
        <Input
          label="Escola"
          name="escola"
          value={studentData.escola}
          onChange={handleChange}
          error={formErrors.escola}
        />
        <Input
          label="Série/Ano"
          name="serieAno"
          value={studentData.serieAno}
          onChange={handleChange}
          error={formErrors.serieAno}
        />
        <div>
          <label
            htmlFor="interesses"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Interesses (separados por vírgula)
          </label>
          <textarea
            id="interesses"
            name="interesses"
            rows="3"
            value={studentData.interesses}
            onChange={handleChange}
            className="appearance-none rounded-md relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm"
          />
          {formErrors.interesses && (
            <p className="text-red-500 text-xs mt-1">{formErrors.interesses}</p>
          )}
        </div>
        <div className="flex items-center">
          <input
            type="checkbox"
            id="isActive"
            name="isActive"
            checked={studentData.isActive}
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
            onClick={() =>
              navigate("/minha-area/superadmin/usuarios/estudantes")
            }
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-brandPurple-700 text-white rounded-md hover:bg-brandPurple-800 disabled:opacity-50"
          >
            {isLoading ? "Salvando..." : "Salvar Alterações"}
          </button>
        </div>
      </form>
    </div>
  );
};
export default EditarEstudantePage;
