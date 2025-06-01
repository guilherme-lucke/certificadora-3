import apiClient from "./api";

const signup = async (userData) => {
  try {

    const { confirmPassword: _confirmPassword, ...dataToSend } = userData;

    const response = await apiClient.post("/auth/signup", dataToSend);
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data; 
    }
    throw error;
  }
};

const login = async (credentials) => {
  try {
    const response = await apiClient.post("/auth/login", credentials);
    if (response.data && response.data.success && response.data.data.token) {
      localStorage.setItem("authToken", response.data.data.token); 
      localStorage.setItem("user", JSON.stringify(response.data.data.user));
    }
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

const forgotPassword = async (email) => {
  try {
    const response = await apiClient.post("/auth/forgot-password", { email });
    // A API deve retornar algo como { success: true, message: "Instruções enviadas..." }
    return response.data;
  } catch (error) {
    if (error.response && error.response.data) {
      throw error.response.data;
    }
    throw error;
  }
};

export default {
  signup,
  login,
  forgotPassword,
  resetPassword: async (token, newPassword) => {
    try {
      const response = await apiClient.post(`/auth/reset-password/${token}`, {
        newPassword,
      });
      // A API deve retornar { success: true, message: "Senha redefinida..." }
      return response.data;
    } catch (error) {
      if (error.response && error.response.data) {
        throw error.response.data;
      }
      throw error;
    }
  },
};