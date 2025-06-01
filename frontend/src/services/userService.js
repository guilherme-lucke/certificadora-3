import apiClient from "./api";

const getProfile = async () => {
  try {
    const response = await apiClient.get("/users/me");
    return response.data; 
  } catch (error) {
    console.error("Erro ao buscar perfil:", error);
    if (error.response && error.response.data) throw error.response.data;
    throw error;
  }
};

const updateProfile = async (profileData) => {
  try {
    const { email, role, ...updatableData } = profileData; 
    const response = await apiClient.put("/users/me", updatableData);
    return response.data;
  } catch (error) {
    console.error("Erro ao atualizar perfil:", error);
    if (error.response && error.response.data) throw error.response.data;
    throw error;
  }
};

const changePassword = async (passwordData) => {
  // passwordData = { currentPassword: '...', newPassword: '...' }
  try {
    const response = await apiClient.put("/users/me/password", passwordData);
    return response.data; 
  } catch (error) {
    console.error("Erro ao alterar senha:", error);
    if (error.response && error.response.data) throw error.response.data;
    throw error;
  }
};

const deleteMyAccount = async () => {
  try {
    const response = await apiClient.delete("/users/me/account");
    return response.data; 
  } catch (error) {
    console.error("Erro ao excluir conta:", error);
    if (error.response && error.response.data) throw error.response.data;
    throw error;
  }
};

export default {
  getProfile,
  updateProfile,
  changePassword,
  deleteMyAccount,
};