// frontend/src/pages/admin/activities/ListarAtividadesAdminPage.jsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import adminActivityService from "../../../services/adminActivityService";
import Modal from "../../../components/common/Modal"; // Modal de confirmação de exclusão
import EnrolledStudentsModal from "../../../components/admin/activities/EnrolledStudentsModal"; // Novo Modal
import { formatDate } from "../../../utils/formatters"; // Assumindo que está em utils

const ListarAtividadesAdminPage = () => {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalActivities, setTotalActivities] = useState(0);
  const [searchTerm, setSearchTerm] = useState("");
  const [limit] = useState(10); // Atividades por página

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [activityToDelete, setActivityToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState(""); // Para erros de exclusão ou outros
  const [successMessage, setSuccessMessage] = useState("");

  // Estados para o modal de inscritos
  const [isEnrolledModalOpen, setIsEnrolledModalOpen] = useState(false);
  const [selectedActivityForModal, setSelectedActivityForModal] =
    useState(null);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isLoadingEnrolled, setIsLoadingEnrolled] = useState(false);
  const [errorEnrolled, setErrorEnrolled] = useState("");

  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // Limpar actionError e successMessage aqui pode ser muito agressivo se eles
    // forem de uma ação anterior que o usuário ainda não viu.
    // Considere limpar apenas quando uma nova ação é iniciada.
    // setActionError("");
    // setSuccessMessage("");
    try {
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
      };
      const responseData = await adminActivityService.getAllActivities(params);
      setActivities(responseData.data || []);
      setTotalActivities(responseData.total || 0);
      setTotalPages(responseData.totalPages || 1);
    } catch (err) {
      setError(err.message || "Falha ao carregar atividades.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, searchTerm]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  const openDeleteModal = (activity) => {
    setActivityToDelete(activity);
    setIsDeleteModalOpen(true);
    setActionError(""); // Limpa erro de ação anterior
    setSuccessMessage(""); // Limpa mensagem de sucesso anterior
  };

  const handleOpenEnrolledModal = async (activity) => {
    setSelectedActivityForModal(activity);
    setIsEnrolledModalOpen(true);
    setIsLoadingEnrolled(true);
    setErrorEnrolled("");
    setEnrolledStudents([]); // Limpa inscritos anteriores

    try {
      const enrollmentsData = await adminActivityService.getActivityEnrollments(
        activity._id
      );
      setEnrolledStudents(enrollmentsData || []);
    } catch (err) {
      console.error("Erro ao buscar inscritos:", err);
      setErrorEnrolled(err.message || "Falha ao carregar lista de inscritos.");
    } finally {
      setIsLoadingEnrolled(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!activityToDelete) return;

    setIsDeleting(true);
    setActionError("");
    setSuccessMessage("");

    try {
      const idToDelete = activityToDelete._id; // Usar _id como padrão do backend
      const response = await adminActivityService.deleteActivity(idToDelete);

      if (response.success) {
        setSuccessMessage(
          response.message || "Atividade excluída com sucesso!"
        );
        // Verifica se a página atual ficará vazia e ajusta se necessário
        if (activities.length === 1 && currentPage > 1) {
          setCurrentPage(currentPage - 1);
          // fetchActivities será chamado pelo useEffect devido à mudança em currentPage
        } else {
          // Refetch activities para atualizar a lista e a paginação na página atual
          fetchActivities();
        }
      } else {
        setActionError(response.error?.message || "Erro ao excluir atividade.");
      }
    } catch (err) {
      console.error("Erro ao excluir atividade:", err);
      setActionError(
        err.message || "Falha ao excluir atividade. Tente novamente."
      );
    } finally {
      setIsDeleting(false);
      setIsDeleteModalOpen(false);
      setActivityToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <p className="text-center text-gray-500">Carregando atividades...</p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Erro: {error}</p>;
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Gerenciar Atividades ({totalActivities})
        </h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar por nome..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Volta para primeira página ao buscar
            }}
          />
          <Link
            to="/minha-area/admin/atividades/nova"
            className="bg-brandPurple-700 hover:bg-brandPurple-800 text-white font-medium py-2 px-4 rounded-md transition duration-150"
          >
            + Criar Nova Atividade
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

      {activities.length === 0 && !isLoading ? (
        <p className="text-center text-gray-500">
          Nenhuma atividade encontrada.
        </p>
      ) : (
        <>
          <div className="bg-white shadow-md rounded-lg overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Nome
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Tipo
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Data Início
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Status
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Vagas (Inscritos/Total)
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Criado Por
                  </th>
                  <th scope="col" className="relative px-6 py-3">
                    <span className="sr-only">Ações</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {activities.map((activity) => (
                  <tr key={activity._id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {activity.nome}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.tipo}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(activity.dataHoraInicio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          activity.status === "Publicada" ||
                          activity.status === "Inscrições Abertas"
                            ? "bg-green-100 text-green-800"
                            : activity.status === "Rascunho"
                            ? "bg-yellow-100 text-yellow-800"
                            : activity.status === "Vagas Esgotadas"
                            ? "bg-orange-100 text-orange-800"
                            : activity.status === "Cancelada"
                            ? "bg-red-100 text-red-800"
                            : "bg-gray-100 text-gray-800" // Para Em Andamento, Realizada, Inscrições Encerradas
                        }`}
                      >
                        {activity.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {`${activity.inscricoesCount || 0} / ${
                        activity.vagasTotal
                      }`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {activity.criadoPor?.nomeCompleto || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      <Link
                        to={`/minha-area/admin/atividades/${activity._id}/editar`}
                        className="text-brandPurple-600 hover:text-brandPurple-800"
                      >
                        Editar
                      </Link>
                      <button
                        onClick={() => handleOpenEnrolledModal(activity)}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Inscritos ({activity.inscricoesCount || 0})
                      </button>
                      <button
                        onClick={() => openDeleteModal(activity)}
                        className="text-red-600 hover:text-red-900"
                        disabled={
                          isDeleting && activityToDelete?._id === activity._id
                        }
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Controles de Paginação */}
          {totalPages > 1 && (
            <div className="mt-6 flex items-center space-x-2">
              {" "}
              {/* Alterado aqui: justify-start implícito e space-x-2 para espaçamento interno */}
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
          )}
        </>
      )}

      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Exclusão de Atividade"
        onConfirm={handleConfirmDelete}
        confirmText="Sim, Excluir"
        confirmingText="Excluindo..."
        isConfirming={isDeleting}
        confirmButtonVariant="danger"
      >
        <p>
          Tem certeza que deseja excluir a atividade{" "}
          <strong>"{activityToDelete?.nome}"</strong>?
        </p>
        <p className="text-sm text-red-700 mt-2">
          Esta ação não poderá ser desfeita.
        </p>
      </Modal>

      {/* Modal para exibir estudantes inscritos */}
      {selectedActivityForModal && (
        <EnrolledStudentsModal
          isOpen={isEnrolledModalOpen}
          onClose={() => {
            setIsEnrolledModalOpen(false);
            setSelectedActivityForModal(null); // Limpa a atividade selecionada
            setEnrolledStudents([]); // Limpa os dados dos inscritos
          }}
          activityName={selectedActivityForModal.nome}
          enrollments={enrolledStudents}
          isLoading={isLoadingEnrolled}
          error={errorEnrolled}
        />
      )}
    </div>
  );
};

export default ListarAtividadesAdminPage;
