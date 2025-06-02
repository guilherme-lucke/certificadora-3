import apiClient from "./api"; // Sua instância configurada do Axios

const getAllActivities = async (params = {}) => {
  // Adiciona params como argumento
  try {
    // Passa os parâmetros para a requisição GET
    const response = await apiClient.get("/admin/activities", { params });
    // O backend agora retorna um objeto com { success, data, total, currentPage, totalPages, limit }
    if (response.data && response.data.success) {
      return response.data; // Retorna o objeto completo da API
    }
    throw new Error(
      response.data?.error?.message || "Erro ao buscar atividades."
    );
  } catch (error) {
    console.error("Erro em adminActivityService.getAllActivities:", error);
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

const getActivityById = async (activityId) => {
  try {
    const response = await apiClient.get(`/admin/activities/${activityId}`);
    // Contrato da API: { success: true, data: activityDetails }
    if (response.data && response.data.success) {
      return response.data.data; // Retorna os detalhes da atividade
    }
    throw new Error(
      response.data?.error?.message || "Erro ao buscar detalhes da atividade."
    );
  } catch (error) {
    console.error("Erro em adminActivityService.getActivityById:", error);
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

const createActivity = async (activityData) => {
  try {
    const response = await apiClient.post("/admin/activities", activityData);
    // Contrato da API: { success: true, data: newActivity, message }
    return response.data; // Retorna a resposta completa { success, data, message }
  } catch (error) {
    console.error("Erro em adminActivityService.createActivity:", error);
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error; // Erro de validação, por exemplo
    }
    throw error;
  }
};

const updateActivity = async (activityId, activityData) => {
  try {
    const response = await apiClient.put(
      `/admin/activities/${activityId}`,
      activityData
    );
    // Contrato da API: { success: true, data: updatedActivity, message }
    return response.data; // Retorna a resposta completa
  } catch (error) {
    console.error("Erro em adminActivityService.updateActivity:", error);
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

const deleteActivity = async (activityId) => {
  try {
    const response = await apiClient.delete(`/admin/activities/${activityId}`);
    // Contrato da API: { success: true, message } ou 204 No Content
    // Se for 204, response.data pode ser undefined/vazio.
    if (response.status === 204) {
      return { success: true, message: "Atividade excluída com sucesso!" };
    }
    return response.data; // Retorna { success, message }
  } catch (error) {
    console.error("Erro em adminActivityService.deleteActivity:", error);
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

const getActivityEnrollments = async (activityId) => {
  try {
    const response = await apiClient.get(
      `/admin/activities/${activityId}/inscriptions`
    );
    if (response.data && response.data.success) {
      return response.data.data; // Retorna o array de inscrições
    }
    throw new Error(
      response.data?.error?.message || "Erro ao buscar inscritos na atividade."
    );
  } catch (error) {
    console.error(
      "Erro em adminActivityService.getActivityEnrollments:",
      error
    );
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

export default {
  getAllActivities,
  getActivityById,
  createActivity,
  updateActivity,
  deleteActivity,
  getActivityEnrollments,
};
