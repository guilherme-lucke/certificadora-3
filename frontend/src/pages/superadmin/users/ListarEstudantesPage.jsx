import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import superAdminUserService from "../../../services/superAdminUserService";
import Modal from "../../../components/common/Modal";
import { formatDate } from "../../../utils/formatters";

const ListarEstudantesPage = () => {
  const [students, setStudents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalStudents, setTotalStudents] = useState(0); // Novo estado
  const [searchTerm, setSearchTerm] = useState("");
  const [limit] = useState(10); // Busca estudantes da API com paginação e busca

  // Estados para o modal de exclusão
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [studentToDelete, setStudentToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false); // Novo estado

  const fetchStudents = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setActionError(""); // Resetar erros de ação
    setSuccessMessage(""); // Resetar mensagens de sucesso
    try {
      const params = {
        page: currentPage,
        limit,
        search: searchTerm,
      };
      const responseData = await superAdminUserService.getStudents(params);
      setStudents(responseData.students || []);
      setTotalStudents(responseData.total || 0); // Atualiza o total de estudantes
      setTotalPages(Math.ceil(responseData.total / responseData.limit));
    } catch (err) {
      console.error("Erro ao buscar estudantes:", err);
      setError(err.message || "Falha ao carregar estudantes.");
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, limit, searchTerm]);
  // Atualiza a lista quando mudar a página ou o termo de busca
  useEffect(() => {
    fetchStudents();
  }, [fetchStudents]); // Recarrega quando mudar página ou termo de busca
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [studentToToggleStatus, setStudentToToggleStatus] = useState(null);
  const [newStatusForToggle, setNewStatusForToggle] = useState(null); // Inicializar como null para consistência
  const handleToggleStudentStatus = (studentId, newIsActiveStatus) => {
    const student = students.find((s) => s._id === studentId);
    setStudentToToggleStatus(student);
    setNewStatusForToggle(newIsActiveStatus);
    setIsStatusModalOpen(true);
  };
  const handleConfirmStatusChange = async () => {
    if (!studentToToggleStatus || newStatusForToggle === null) return; // Checagem adicional
    setIsUpdatingStatus(true); // Usar novo estado
    setActionError("");
    setSuccessMessage("");
    try {
      await superAdminUserService.updateStudent(studentToToggleStatus._id, {
        isActive: newStatusForToggle,
      });
      // Atualizar a lista local
      setStudents((prevStudents) =>
        prevStudents.map((s) =>
          s._id === studentToToggleStatus._id
            ? { ...s, isActive: newStatusForToggle }
            : s
        )
      );
      setSuccessMessage(`Status do estudante atualizado com sucesso!`);
      setActionError(""); // Limpa qualquer erro anterior
    } catch (err) {
      console.error("Erro ao atualizar status do estudante:", err);
      setActionError(err.message || "Falha ao atualizar status.");
      setSuccessMessage(""); // Limpa qualquer mensagem de sucesso anterior
    } finally {
      setIsUpdatingStatus(false); // Usar novo estado
      setIsStatusModalOpen(false);
      setStudentToToggleStatus(null);
      setNewStatusForToggle(null); // Resetar
    }
  };

  const openDeleteStudentModal = (student) => {
    setStudentToDelete(student);
    setIsDeleteModalOpen(true);
    setActionError("");
    setSuccessMessage("");
  };

  const handleConfirmDeleteStudent = async () => {
    if (!studentToDelete) return;
    setIsDeleting(true);
    setActionError("");
    setSuccessMessage("");
    try {
      await superAdminUserService.deleteStudent(studentToDelete._id);
      setSuccessMessage("Estudante removido com sucesso!");

      // Verifica se a página atual ficará vazia e ajusta se necessário
      if (students.length === 1 && currentPage > 1) {
        setCurrentPage(currentPage - 1);
        // fetchStudents será chamado pelo useEffect devido à mudança em currentPage
      } else {
        // Refetch students para atualizar a lista e a paginação na página atual
        fetchStudents();
      }
      // Não é mais necessário atualizar o estado local 'students' manualmente aqui,
      // pois fetchStudents cuidará disso.
      // setStudents((prevStudents) =>
      //   prevStudents.filter((s) => s._id !== studentToDelete._id)
      // );
      setIsDeleteModalOpen(false);
      setStudentToDelete(null);
    } catch (err) {
      setActionError(err.message || "Falha ao remover estudante.");
    } finally {
      setIsDeleting(false);
    }
  };

  // TODO: JSX da tabela

  if (isLoading) return <p>Carregando estudantes...</p>;
  if (error) return <p className="text-red-500">Erro: {error}</p>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6 border-b pb-4">
        <h1 className="text-2xl font-semibold text-gray-800">
          Gerenciar Estudantes ({totalStudents})
        </h1>
        <div className="flex items-center space-x-4">
          <input
            type="text"
            placeholder="Buscar estudantes..."
            className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-brandPurple-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1); // Volta para primeira página ao buscar
            }}
          />
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
      {students.length === 0 ? (
        <p className="text-center text-gray-500">
          Nenhum estudante encontrado.
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
                  Escola
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
              {students.map((student) => (
                <tr key={student._id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {student.nomeCompleto}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {student.escola}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        student.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {student.isActive ? "Ativo" : "Inativo"}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(student.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                    {/* Botão Editar: Visível se estudante ativo OU se inativo E NÃO anonimizado */}
                    {(student.isActive ||
                      (student.email && !student.email.includes("@anon."))) && (
                      <Link
                        to={`/minha-area/superadmin/usuarios/estudantes/${student._id}/editar`}
                        className="text-brandPurple-600 hover:text-brandPurple-800"
                      >
                        Editar
                      </Link>
                    )}
                    {/* Botão Ativar/Desativar */}
                    {student.isActive ? (
                      <button // Botão Desativar para ativos
                        onClick={() =>
                          handleToggleStudentStatus(student._id, false)
                        }
                        className="text-yellow-600 hover:text-yellow-900"
                      >
                        Desativar
                      </button>
                    ) : (
                      // Para inativos, mostrar Ativar SOMENTE SE NÃO anonimizado
                      student.email &&
                      !student.email.includes("@anon.") && (
                        <button
                          onClick={() =>
                            handleToggleStudentStatus(student._id, true)
                          }
                          className="text-green-600 hover:text-green-900"
                        >
                          Ativar
                        </button>
                      )
                    )}
                    <button
                      onClick={() => openDeleteStudentModal(student)}
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
      {/* Modal de confirmação de alteração de status */}{" "}
      <Modal
        isOpen={isStatusModalOpen}
        onClose={() => {
          setIsStatusModalOpen(false);
          setStudentToToggleStatus(null);
        }}
        title="Confirmar Alteração de Status"
        onConfirm={handleConfirmStatusChange}
        confirmText={`Sim, ${newStatusForToggle ? "Ativar" : "Desativar"}`}
        confirmingText="Atualizando..."
        isConfirming={isUpdatingStatus}
        confirmButtonVariant={newStatusForToggle ? "success" : "warning"}
      >
        <p className="mb-4">
          {" "}
          {/* Removido p-6 e mb-4 daqui para o conteúdo direto */}
          Tem certeza que deseja {newStatusForToggle ? "ativar" : "desativar"} o
          estudante{" "}
          <strong>
            "{studentToToggleStatus?.nomeCompleto || "este estudante"}"
          </strong>
          ?
        </p>
      </Modal>
      {/* Modal de Exclusão de Estudante */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirmar Remoção de Estudante"
        onConfirm={handleConfirmDeleteStudent}
        confirmText="Sim, Remover"
        confirmingText="Removendo..."
        isConfirming={isDeleting}
        confirmButtonVariant="danger"
      >
        <p>
          Tem certeza que deseja remover o estudante{" "}
          <strong>"{studentToDelete?.nomeCompleto}"</strong>?
        </p>
        <p className="text-sm text-red-700 mt-2">
          Esta ação não poderá ser desfeita.
        </p>
      </Modal>
    </div>
  );
};
export default ListarEstudantesPage;
