import apiClient from "./api";

const getPublicActivities = async (initialParams = {}) => {
  let queryParams = { ...initialParams }; 

  if (
    Object.prototype.hasOwnProperty.call(queryParams, "tipo") &&
    queryParams.tipo === ""
  ) {
    delete queryParams.tipo;
  }

  try {
    const response = await apiClient.get("/public/activities", {
      params: queryParams,
    });
    if (response.data && response.data.success) {
      return response.data.data;
    }
    throw new Error(
      response.data?.error?.message || "Erro ao buscar atividades públicas."
    );
  } catch (error) {
    console.error("Erro ao buscar atividades públicas:", error);
    if (error.response && error.response.data && error.response.data.error) {
      throw error.response.data.error;
    }
    throw error;
  }
};

export default {
  getPublicActivities,
};