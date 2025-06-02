import apiClient from "./api"; // Sua instância configurada do Axios

/**
 * Busca uma lista de todos os usuários estudantes.
 * @param {object} params - Parâmetros de query (ex: para paginação, busca).
 * @returns {Promise<object>} A resposta da API, esperando { success: true, data: { total, page, limit, students: [] } }.
 * @throws {Error}
 */
const getStudents = async (params = {}) => {
  try {
    const response = await apiClient.get("/superadmin/users/students", {
      params,
    });
    if (response.data && response.data.success) {
      return response.data.data; // Retorna o objeto { total, page, limit, students }
    }
    throw new Error(
      response.data?.error?.message || "Erro ao buscar lista de estudantes."
    );
  } catch (error) {
    console.error("Erro em superAdminUserService.getStudents:", error);
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

/**
 * Busca os detalhes de um usuário estudante específico.
 * @param {string} userId - O ID do estudante.
 * @returns {Promise<object>} Os dados do estudante, esperando { success: true, data: { ...studentDetails } }.
 * @throws {Error}
 */
const getStudentById = async (userId) => {
  try {
    const response = await apiClient.get(
      `/superadmin/users/students/${userId}`
    );
    if (response.data && response.data.success) {
      return response.data.data; // Retorna o objeto do estudante
    }
    throw new Error(
      response.data?.error?.message || "Erro ao buscar detalhes do estudante."
    );
  } catch (error) {
    console.error("Erro em superAdminUserService.getStudentById:", error);
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

/**
 * Atualiza os dados de um usuário estudante.
 * @param {string} userId - O ID do estudante a ser atualizado.
 * @param {object} studentData - Objeto com os dados a serem atualizados.
 * @returns {Promise<object>} A resposta da API, esperando { success: true, data: { ...updatedStudent }, message }.
 * @throws {Error}
 */
const updateStudent = async (userId, studentData) => {
  try {
    // O contrato da API sugere que o PUT /superadmin/users/students/:userId atualiza os dados, incluindo isActive.
    // Se houvesse um endpoint separado para /status, teríamos outra função.
    const response = await apiClient.put(
      `/superadmin/users/students/${userId}`,
      studentData
    );
    return response.data; // Retorna a resposta completa { success, data, message }
  } catch (error) {
    console.error("Erro em superAdminUserService.updateStudent:", error);
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

/**
 * Cria um novo usuário com o papel 'admin'.
 * @param {object} adminData - Dados do novo admin (nomeCompleto, email, password, etc.).
 * @returns {Promise<object>} A resposta da API, esperando { success: true, data: { ...newAdmin }, message }.
 * @throws {Error}
 */
const createAdmin = async (adminData) => {
  try {
    const response = await apiClient.post(
      "/superadmin/users/admins",
      adminData
    );
    return response.data;
  } catch (error) {
    console.error("Erro em superAdminUserService.createAdmin:", error);
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

/**
 * Busca uma lista de todos os usuários administradores.
 * @param {object} params - Parâmetros de query (ex: para paginação).
 * @returns {Promise<object>} A resposta da API, esperando { success: true, data: { total, page, limit, admins: [] } }.
 * @throws {Error}
 */
const getAdmins = async (params = {}) => {
  try {
    const response = await apiClient.get("/superadmin/users/admins", {
      params,
    });
    if (response.data && response.data.success) {
      return response.data.data; // Retorna o objeto { total, page, limit, admins }
    }
    throw new Error(
      response.data?.error?.message ||
        "Erro ao buscar lista de administradores."
    );
  } catch (error) {
    console.error("Erro em superAdminUserService.getAdmins:", error);
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

/**
 * Atualiza os dados de um usuário administrador.
 * @param {string} userId - O ID do admin a ser atualizado.
 * @param {object} adminData - Objeto com os dados a serem atualizados.
 * @returns {Promise<object>} A resposta da API, esperando { success: true, data: { ...updatedAdmin }, message }.
 * @throws {Error}
 */
const updateAdmin = async (userId, adminData) => {
  try {
    const response = await apiClient.put(
      `/superadmin/users/admins/${userId}`,
      adminData
    );
    return response.data;
  } catch (error) {
    console.error("Erro em superAdminUserService.updateAdmin:", error);
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

/**
 * Remove (exclui) uma conta de administrador.
 * @param {string} userId - O ID do admin a ser removido.
 * @returns {Promise<object>} A resposta da API, esperando { success: true, message }.
 * @throws {Error}
 */
const deleteAdmin = async (userId) => {
  try {
    const response = await apiClient.delete(
      `/superadmin/users/admins/${userId}`
    );
    if (response.status === 204) {
      return { success: true, message: "Administrador removido com sucesso!" };
    }
    return response.data;
  } catch (error) {
    console.error("Erro em superAdminUserService.deleteAdmin:", error);
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

/**
 * Remove (exclui) uma conta de estudante.
 * @param {string} userId - O ID do estudante a ser removido.
 * @returns {Promise<object>} A resposta da API, esperando { success: true, message }.
 * @throws {Error}
 */
const deleteStudent = async (userId) => {
  try {
    const response = await apiClient.delete(
      `/superadmin/users/students/${userId}`
    );
    // API pode retornar 204 No Content para DELETE bem-sucedido
    if (response.status === 204) {
      return { success: true, message: "Estudante removido com sucesso!" };
    }
    return response.data; // Caso a API retorne um corpo com { success, message }
  } catch (error) {
    console.error("Erro em superAdminUserService.deleteStudent:", error);
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

/**
 * Altera o papel de um usuário específico.
 * @param {string} userId - O ID do usuário.
 * @param {string} role - O novo papel (ex: 'admin', 'estudante').
 * @returns {Promise<object>} A resposta da API, esperando { success: true, data: { ...userWithNewRole }, message }.
 * @throws {Error}
 */
const updateUserRole = async (userId, role) => {
  try {
    const response = await apiClient.put(`/superadmin/users/${userId}/role`, {
      role,
    });
    return response.data;
  } catch (error) {
    console.error("Erro em superAdminUserService.updateUserRole:", error);
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

/**
 * Busca os detalhes de um usuário administrador específico.
 * @param {string} userId - O ID do administrador.
 * @returns {Promise<object>} Os dados do admin, esperando { success: true, data: { ...adminDetails } }.
 * @throws {Error}
 */
const getAdminById = async (userId) => {
  try {
    const response = await apiClient.get(`/superadmin/users/admins/${userId}`);
    if (response.data && response.data.success) {
      return response.data.data; // Retorna o objeto do admin
    }
    throw new Error(
      response.data?.error?.message ||
        "Erro ao buscar detalhes do administrador."
    );
  } catch (error) {
    console.error("Erro em superAdminUserService.getAdminById:", error);
    if (error.response?.data?.error) throw error.response.data.error;
    throw error;
  }
};

export default {
  getStudents,
  getStudentById,
  updateStudent,
  createAdmin,
  getAdmins,
  getAdminById,
  updateAdmin,
  deleteAdmin,
  deleteStudent, // Adicionado aqui
  updateUserRole,
};
