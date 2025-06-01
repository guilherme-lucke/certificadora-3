// frontend/src/pages/superadmin/users/ListarAdminsPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import superAdminUserService from "../../../services/superAdminUserService";
import Modal from "../../../components/common/Modal"; // Para confirmação de exclusão/status
import { formatDate } from "../../../utils/formatters";

const ListarAdminsPage = () => {
  const [admins, setAdmins] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalAdmins, setTotalAdmins] = useState(0); // Novo estado
  const [searchTerm, setSearchTerm] = useState("");
  const [limit] = useState(10); // Admins por página

  const [actionError, setActionError] = useState(""); // Para erros de ações como delete/status
  const [successMessage, setSuccessMessage] = useState("");

  // Estado para o modal de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [adminToDelete, setAdminToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Estado para o modal de alteração de status
  const [isToggleStatusModalOpen, setIsToggleStatusModalOpen] = useState(false);
  const [adminToToggleStatus, setAdminToToggleStatus] = useState(null);
  const [newStatusForAdmin, setNewStatusForAdmin] = useState(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

  const fetchAdmins = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setActionError("");
    setSuccessMessage("");
    try {
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
      };
      const responseData = await superAdminUserService.getAdmins(params);
      setAdmins(responseData.admins || []);
      setTotalAdmins(responseData.total || 0); // Atualiza o total de admins
      setTotalPages(Math.ceil(responseData.total / responseData.limit) || 1);
    } catch (err) {
      setError(err.message || "Falha ao carregar administradores.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, searchTerm]);

  useEffect(() => {
    fetchAdmins();
  }, [fetchAdmins]);

  const openToggleStatusModal = (admin, newStatus) => {
    setAdminToToggleStatus(admin);
    setNewStatusForAdmin(newStatus);
    setIsToggleStatusModalOpen(true);
    setActionError("");
    setSuccessMessage("");
  };

  const handleConfirmToggleAdminStatus = async () => {
    if (!adminToToggleStatus || newStatusForAdmin === null) return;

    setIsTogglingStatus(true);
    setActionError("");
    setSuccessMessage("");
    try {
      await superAdminUserService.updateAdmin(adminToToggleStatus._id, {
        isActive: newStatusForAdmin,
      });
      setAdmins((prevAdmins) =>
        prevAdmins.map((a) =>
          a._id === adminToToggleStatus._id
            ? { ...a, isActive: newStatusForAdmin }
            : a
        )
      );
      setSuccessMessage(`Status do administrador atualizado!`);
      setIsToggleStatusModalOpen(false);
      setAdminToToggleStatus(null);
      setNewStatusForAdmin(null);
    } catch (err) {
      setActionError(err.message || "Falha ao atualizar status do admin.");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const openDeleteAdminModal = (admin) => {
    setAdminToDelete(admin);
    setIsDeleteModalOpen(true);
    setActionError("");
    setSuccessMessage("");
  };

  const handleConfirmDeleteAdmin = async () => {
    if (!adminToDelete) return;
    setIsDeleting(true);
    setActionError("");
    setSuccessMessage("");
    try {
      await superAdminUserService.deleteAdmin(adminToDelete._id);
      setSuccessMessage("Administrador removido com sucesso!");

      // Verifica se a página atual ficará vazia e ajusta se necessário
      if (admins.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
        // fetchAdmins será chamado pelo useEffect devido à mudança em currentPage
      } else {
        // Refetch admins para atualizar a lista e a paginação na página atual
        fetchAdmins();
      }
      // Não é mais necessário atualizar o estado local 'admins' manualmente aqui,
      // pois fetchAdmins cuidará disso.
      // setAdmins((prevAdmins) =>
      //   prevAdmins.filter((a) => a._id !== adminToDelete._id)
      // );
      setIsDeleteModalOpen(false);
      setAdminToDelete(null);
    } catch (err) {
      setActionError(err.message || "Falha ao remover administrador.");
    } finally {
      setIsDeleting(false);
    }
  };

  // TODO: JSX da tabela

  if (isLoading) return <p>Carregando administradores...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Gerenciar Administradores ({totalAdmins})
        </h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar administradores..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Volta para primeira página ao buscar
            }}
          />
          <Link
            to="/minha-area/superadmin/usuarios/admins/nova"
            className="bg-brandPurple-700 hover:bg-brandPurple-800 text-white font-medium py-2 px-4 rounded-md transition duration-150"
          >
            + Criar Novo Admin
          </Link>
        </div>
      </div>
      {actionError && (
        <p className="text-red-500 bg-red-100 p-2 rounded mb-4">
          {actionError}
        </p>
      )}
      {successMessage && (
        <p className="text-green-500 bg-green-100 p-2 rounded mb-4">
          {successMessage}
        </p>
      )}

      {admins.length === 0 ? (
        <p className="text-center text-gray-500">
          Nenhum administrador cadastrado.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Nome
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Criação
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {admins.map((admin) => (
                <tr key={admin._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {admin.nomeCompleto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {admin.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        admin.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {admin.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(admin.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {/* Botão Editar: Visível se admin ativo OU se inativo E NÃO anonimizado */}
                    {(admin.isActive ||
                      (admin.email && !admin.email.includes("@anon."))) && (
                      <Link
                        to={`/minha-area/superadmin/usuarios/admins/${admin._id}/editar`}
                        className="text-brandPurple-600 hover:text-brandPurple-800"
                      >
                        Editar
                      </Link>
                    )}
                    {/* Botão Ativar/Desativar */}
                    {admin.isActive ? (
                      <button // Botão Desativar para ativos
                        onClick={() => openToggleStatusModal(admin, false)}
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Desativar
                      </button>
                    ) : (
                      // Para inativos, mostrar Ativar SOMENTE SE NÃO anonimizado
                      admin.email &&
                      !admin.email.includes("@anon.") && (
                        <button
                          onClick={() => openToggleStatusModal(admin, true)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Ativar
                        </button>
                      )
                    )}
                    <button
                      onClick={() => openDeleteAdminModal(admin)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Remover
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {/* Controles de Paginação */}
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === 1
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              Anterior
            </button>
            <span className="text-sm text-gray-700">
              Página {currentPage} de {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className={`px-4 py-2 text-sm font-medium rounded-md ${
                currentPage === totalPages
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-white text-gray-700 hover:bg-gray-50 border"
              }`}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
      {/* Modal de Exclusão */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Remoção de Administrador"
        onConfirm={handleConfirmDeleteAdmin}
        confirmText="Sim, Remover"
        confirmingText="Removendo..." // Adicionado
        isConfirming={isDeleting}
        confirmButtonVariant="danger" // Explícito, embora seja o padrão
      >
        <p>
          Tem certeza que deseja remover o administrador{" "}
          <strong>"{adminToDelete?.nomeCompleto}"</strong>?
        </p>
        <p className="text-sm text-red-700 mt-2">
          Esta ação não poderá ser desfeita.
        </p>
      </Modal>

      {/* Modal de Alteração de Status */}
      <Modal
        isOpen={isToggleStatusModalOpen}
        onClose={() => setIsToggleStatusModalOpen(false)}
        title={`Confirmar ${
          newStatusForAdmin ? "Ativação" : "Desativação"
        } de Administrador`}
        onConfirm={handleConfirmToggleAdminStatus}
        confirmText={`Sim, ${newStatusForAdmin ? "Ativar" : "Desativar"}`}
        confirmingText="Atualizando..." // Adicionado
        isConfirming={isTogglingStatus}
        confirmButtonVariant={newStatusForAdmin ? "success" : "warning"} // Dinâmico
      >
        <p>
          Tem certeza que deseja {newStatusForAdmin ? "ativar" : "desativar"} o
          administrador <strong>"{adminToToggleStatus?.nomeCompleto}"</strong>?
        </p>
      </Modal>
    </div>
  );
};
export default ListarAdminsPage;
