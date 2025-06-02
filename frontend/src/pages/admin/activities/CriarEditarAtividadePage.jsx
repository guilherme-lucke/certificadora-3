import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import adminActivityService from "../../../services/adminActivityService"; // Ajuste o caminho
import Input from "../../../components/common/Input"; // Reutilizar

const TIPOS_ATIVIDADE = [
  { value: "Oficina", label: "Oficina" },
  { value: "Roda de Conversa", label: "Roda de Conversa" },
  { value: "Minicurso", label: "Minicurso" },
  { value: "Mentoria Technovation", label: "Mentoria Technovation" },
  { value: "Outro", label: "Outro" },
];

const CriarEditarAtividadePage = () => {
  const { activityId } = useParams(); // Para pegar o ID da URL no modo de edição
  const navigate = useNavigate();
  const isEditing = Boolean(activityId); // Determina se está em modo de edição

  const [formData, setFormData] = useState({
    nome: "",
    tipo: TIPOS_ATIVIDADE[0].value, // Default para o primeiro tipo
    descricao: "",
    dataHoraInicio: "", // Formato YYYY-MM-DDTHH:mm
    local: "",
    linkOnline: "", // Opcional, se 'local' for 'Online'
    vagasTotal: "",
    periodoInscricaoInicio: "", // Formato YYYY-MM-DDTHH:mm
    periodoInscricaoFim: "", // Formato YYYY-MM-DDTHH:mm
    dataLimiteCancelamento: "", // Formato YYYY-MM-DDTHH:mm
    status: "Rascunho", // Default para novas atividades
  });
  const [isLoading, setIsLoading] = useState(false);
  const [formErrors, setFormErrors] = useState({}); // Para validação do formulário
  const [apiError, setApiError] = useState(""); // Para erros da API

  useEffect(() => {
    if (isEditing && activityId) {
      const fetchData = async () => {
        setIsLoading(true);
        setApiError("");
        try {
          // Buscar dados da atividade
          const activityData = await adminActivityService.getActivityById(
            activityId
          );

          // Formatar datas para o input datetime-local
          const formatDateForInput = (dateString) => {
            if (!dateString) return "";
            const date = new Date(dateString);
            const tzoffset = date.getTimezoneOffset() * 60000;
            const localISOTime = new Date(date.getTime() - tzoffset)
              .toISOString()
              .slice(0, 16);
            return localISOTime;
          };

          // Atualizar o formulário com os dados da atividade
          setFormData({
            nome: activityData.nome || "",
            tipo: activityData.tipo || TIPOS_ATIVIDADE[0].value,
            descricao: activityData.descricao || "",
            dataHoraInicio: formatDateForInput(activityData.dataHoraInicio),
            local: activityData.local || "",
            linkOnline: activityData.linkOnline || "",
            vagasTotal: activityData.vagasTotal || "",
            periodoInscricaoInicio: formatDateForInput(
              activityData.periodoInscricaoInicio
            ),
            periodoInscricaoFim: formatDateForInput(
              activityData.periodoInscricaoFim
            ),
            dataLimiteCancelamento: formatDateForInput(
              activityData.dataLimiteCancelamento
            ),
            status: activityData.status || "Rascunho",
          });
        } catch (err) {
          console.error("Erro ao buscar dados da atividade:", err);
          setApiError(err.message || "Falha ao carregar dados da atividade.");
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    } else {
      // Modo de criação, limpar o formulário
      setFormData({
        nome: "",
        tipo: TIPOS_ATIVIDADE[0].value,
        descricao: "",
        dataHoraInicio: "",
        local: "",
        linkOnline: "",
        vagasTotal: "",
        periodoInscricaoInicio: "",
        periodoInscricaoFim: "",
        dataLimiteCancelamento: "",
        status: "Rascunho",
      });
    }
  }, [isEditing, activityId, navigate]); // Adicione navigate às dependências se usar

  const handleChange = (e) => {
    const { name, value } = e.target;
    // Para vagasTotal, converter para número se não for vazio
    const val =
      name === "vagasTotal" && value !== "" ? parseInt(value, 10) : value;

    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: "" })); // Limpa erro ao digitar
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError("");

    const validateForm = () => {
      const errors = {};
      if (!formData.nome.trim())
        errors.nome = "Nome da atividade é obrigatório.";
      if (!formData.tipo) errors.tipo = "Tipo da atividade é obrigatório.";
      if (!formData.descricao.trim())
        errors.descricao = "Descrição é obrigatória.";
      if (!formData.dataHoraInicio)
        errors.dataHoraInicio = "Data de início é obrigatória.";
      if (formData.vagasTotal === "" || parseInt(formData.vagasTotal, 10) < 0)
        errors.vagasTotal = "Número de vagas inválido ou obrigatório.";
      return errors;
    };

    const validationErrors = validateForm(); // Chame sua função de validação
    setFormErrors(validationErrors);

    if (Object.keys(validationErrors).some((key) => validationErrors[key])) {
      return; // Interrompe se houver erros de validação
    }

    setIsLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await adminActivityService.updateActivity(
          activityId,
          formData
        );
      } else {
        response = await adminActivityService.createActivity(formData);
      }

      if (response.success) {
        // Idealmente, mostrar uma notificação de sucesso (toast)
        navigate("/minha-area/admin/atividades", {
          state: {
            message:
              response.message ||
              (isEditing ? "Atividade atualizada!" : "Atividade criada!"),
          },
        });
      } else {
        setApiError(response.error?.message || "Ocorreu um erro.");
      }
    } catch (err) {
      console.error("Erro ao salvar atividade:", err);
      setApiError(err.message || "Falha ao salvar atividade. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const pageTitle = isEditing ? "Editar Atividade" : "Criar Nova Atividade";

  if (isLoading && isEditing) {
    // Apenas mostra loading se estiver editando e buscando dados
    return <p className="text-center">Carregando dados da atividade...</p>;
  }

  if (apiError) {
    return <p className="text-center text-red-500">Erro: {apiError}</p>;
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold text-gray-800 mb-6 border-b pb-4">
        {pageTitle}
      </h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        <Input
          label="Nome da Atividade"
          id="nome"
          name="nome"
          value={formData.nome}
          onChange={handleChange}
          error={formErrors.nome}
          required
        />

        <div>
          <label
            htmlFor="tipo"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Tipo
          </label>
          <select
            id="tipo"
            name="tipo"
            value={formData.tipo}
            onChange={handleChange}
            required
            className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
              formErrors.tipo ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm`}
          >
            {TIPOS_ATIVIDADE.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          {formErrors.tipo && (
            <p className="text-red-500 text-xs mt-1">{formErrors.tipo}</p>
          )}
        </div>

        <div>
          <label
            htmlFor="descricao"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Descrição{" "}
            <span className="text-gray-500 text-xs">
              ({formData.descricao.length}/200)
            </span>
          </label>
          <textarea
            id="descricao"
            name="descricao"
            rows="4"
            value={formData.descricao}
            onChange={handleChange}
            required
            maxLength={200}
            className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
              formErrors.descricao ? "border-red-500" : "border-gray-300"
            } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm`}
          />
          {formErrors.descricao && (
            <p className="text-red-500 text-xs mt-1">{formErrors.descricao}</p>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Data e Hora de Início"
            id="dataHoraInicio"
            name="dataHoraInicio"
            type="datetime-local"
            value={formData.dataHoraInicio}
            onChange={handleChange}
            error={formErrors.dataHoraInicio}
            required
          />
          <Input
            label="Vagas Totais"
            id="vagasTotal"
            name="vagasTotal"
            type="number"
            min="0"
            value={formData.vagasTotal}
            onChange={handleChange}
            error={formErrors.vagasTotal}
            required
          />
        </div>

        <Input
          label="Local (ou 'Online')"
          id="local"
          name="local"
          value={formData.local}
          onChange={handleChange}
          error={formErrors.local}
          required
        />

        {formData.local?.toLowerCase().includes("online") && (
          <Input
            label="Link Online (se aplicável)"
            id="linkOnline"
            name="linkOnline"
            type="url"
            value={formData.linkOnline}
            onChange={handleChange}
            error={formErrors.linkOnline}
          />
        )}

        <h3 className="text-lg font-medium text-gray-700 pt-4 border-t mt-6">
          Período de Inscrição
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Input
            label="Início das Inscrições"
            id="periodoInscricaoInicio"
            name="periodoInscricaoInicio"
            type="datetime-local"
            value={formData.periodoInscricaoInicio}
            onChange={handleChange}
            error={formErrors.periodoInscricaoInicio}
            required
          />
          <Input
            label="Fim das Inscrições"
            id="periodoInscricaoFim"
            name="periodoInscricaoFim"
            type="datetime-local"
            value={formData.periodoInscricaoFim}
            onChange={handleChange}
            error={formErrors.periodoInscricaoFim}
            required
          />
        </div>

        <Input
          label="Data Limite para Cancelamento"
          id="dataLimiteCancelamento"
          name="dataLimiteCancelamento"
          type="datetime-local"
          value={formData.dataLimiteCancelamento}
          onChange={handleChange}
          error={formErrors.dataLimiteCancelamento}
          required
        />

        {isEditing && ( // Permitir alterar status apenas na edição
          <div>
            <label
              htmlFor="status"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`appearance-none rounded-md relative block w-full px-3 py-2 border ${
                formErrors.status ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm`}
            >
              <option value="Rascunho">Rascunho</option>
              <option value="Publicada">Publicada</option>
              <option value="Inscrições Abertas">Inscrições Abertas</option>
              <option value="Vagas Esgotadas">Vagas Esgotadas</option>
              <option value="Inscrições Encerradas">
                Inscrições Encerradas
              </option>
              <option value="Em Andamento">Em Andamento</option>
              <option value="Realizada">Realizada</option>
              <option value="Cancelada">Cancelada</option>
            </select>
            {formErrors.status && (
              <p className="text-red-500 text-xs mt-1">{formErrors.status}</p>
            )}
          </div>
        )}

        <div className="flex items-center justify-end space-x-3 pt-6 border-t mt-6">
          <button
            type="button"
            onClick={() => navigate("/minha-area/admin/atividades")} // Voltar para a lista
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandPurple-500"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-brandPurple-700 hover:bg-brandPurple-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brandPurple-500 disabled:opacity-50"
          >
            {isLoading
              ? isEditing
                ? "Salvando..."
                : "Criando..."
              : isEditing
              ? "Salvar Alterações"
              : "Criar Atividade"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CriarEditarAtividadePage;
