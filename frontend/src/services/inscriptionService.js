import apiClient from "./api";

/**
 * Permite que um estudante autenticado se inscreva em uma atividade.
 * @param {string} activityId 
 * @returns {Promise<object>} 
 * @throws {Error}
 */
const enrollInActivity = async (activityId) => {
  if (!activityId) {
    const error = new Error("ID da atividade é obrigatório para inscrição.");
    error.customClientError = true; 
    error.error = { message: "ID da atividade é obrigatório para inscrição." };
    console.error("Erro no enrollInActivity (cliente):", error.error.message);
    throw error;
  }

  try {
    const response = await apiClient.post("/inscriptions", { activityId });
    if (response.data && response.data.success === false) {
      console.error(
        "Erro retornado pela API em enrollInActivity (success:false):",
        response.data.error
      );
      throw (
        response.data.error ||
        new Error(response.data.message || "Falha ao realizar inscrição.")
      );
    }
    return response.data; 
  } catch (error) {
    console.error("Erro em inscriptionService.enrollInActivity (API):", error);
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error; 
    } else if (error.customClientError) {
      throw error;
    }
    throw error; 
  }
};

/**
 * Busca as inscrições ativas do estudante autenticado.
 * @returns {Promise<Array<object>>}
 * @throws {Error} 
 */
const getMyInscriptions = async () => {
  try {
    const response = await apiClient.get("/inscriptions/my");
    if (response.data && response.data.success) {
      const currentDate = new Date();
      const activeInscriptions = (response.data.data || []).filter((insc) => {
        if (!insc.activity) return false;
        const activityDate = new Date(insc.activity.dataHoraInicio);
        const activityHasPassed = activityDate < currentDate;
        const activityIsFinished =
          insc.activity.status === "Realizada" ||
          insc.activity.status === "Cancelada";
        return !activityHasPassed && !activityIsFinished;
      });
      return activeInscriptions;
    }
    console.error(
      "Erro retornado pela API em getMyInscriptions (success:false):",
      response.data.error
    );
    throw new Error(
      response.data?.error?.message || "Erro ao buscar minhas inscrições."
    );
  } catch (error) {
    console.error("Erro em inscriptionService.getMyInscriptions (API):", error);
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

const getMyInscriptionHistory = async () => {
  try {
    const response = await apiClient.get("/inscriptions/my/history");
    if (response.data && response.data.success) {
      return response.data.data || [];
    }
    throw new Error(
      response.data?.error?.message || "Erro ao buscar histórico de inscrições."
    );
  } catch (error) {
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

/**
 * Cancela a inscrição do estudante em uma atividade
 * @param {string} inscriptionId 
 * @returns {Promise<object>}
 * @throws {Error}
 */
const cancelMyInscription = async (inscriptionId) => {
  if (!inscriptionId) {
    throw new Error("ID da inscrição é obrigatório para cancelamento.");
  }

  try {
    const response = await apiClient.delete(`/inscriptions/my/${inscriptionId}`);
    if (response.data && response.data.success) {
      return response.data;
    }
    throw new Error(
      response.data?.error?.message || "Erro ao cancelar inscrição."
    );
  } catch (error) {
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

export default {
  enrollInActivity,
  getMyInscriptions,
  getMyInscriptionHistory,
  cancelMyInscription,
};