import React, { useState, useEffect } from "react";
import userService from "../../services/userService";
import { useAuth } from "../../contexts/AuthContext"; 
import Modal from "../../components/common/Modal"; 
import { useNavigate } from "react-router-dom"; 

const MeuPerfilPage = () => {
  const { setUser } = useAuth(); // Para atualizar o usuário no AuthContext
  const [profileData, setProfileData] = useState(null);
  const [editData, setEditData] = useState({
    nomeCompleto: "",
    telefone: "",
    escola: "",
    serieAno: "",
    interesses: "", // Como string separada por vírgulas para simplificar
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [deleteAccountError, setDeleteAccountError] = useState("");

  const { user, logout } = useAuth(); // Adicionado user para verificar a role
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        const response = await userService.getProfile();
        if (response.success) {
          setProfileData(response.data);
          setEditData({
            // Preenche o formulário de edição com os dados atuais
            nomeCompleto: response.data.nomeCompleto || "",
            telefone: response.data.telefone || "",
            escola: response.data.escola || "",
            serieAno: response.data.serieAno || "",
            interesses: Array.isArray(response.data.interesses)
              ? response.data.interesses.join(", ")
              : response.data.interesses || "",
          });
        } else {
          setError(response.error?.message || "Erro ao buscar perfil.");
        }
      } catch (err) {
        setError(err.error?.message || "Falha ao carregar dados do perfil.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  const openDeleteAccountModal = () => {
    setDeleteAccountError("");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteAccountModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleConfirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteAccountError("");

    try {
      const response = await userService.deleteMyAccount(); // Chamada ao serviço

      if (response.success) {
        // toast.success(response.message || "Conta excluída com sucesso. Você será deslogado.");
        alert(
          response.message || "Conta excluída com sucesso. Você será deslogado."
        );
        logout(); // Desloga o usuário do frontend
        navigate("/login", {
          replace: true,
          state: { message: "Sua conta foi excluída." },
        }); // Redireciona para login
      } else {
        // Erro da API com success: false
        setDeleteAccountError(
          response.error?.message || "Erro ao excluir sua conta."
        );
        // toast.error(response.error?.message || "Erro ao excluir sua conta.");
      }
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
      const errorMessage =
        err.message || "Falha ao excluir sua conta. Tente novamente.";
      setDeleteAccountError(errorMessage);
      // toast.error(errorMessage);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitEdit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    setIsLoading(true);
    try {
      // Converte a string de interesses de volta para array se necessário pelo backend
      const dataToUpdate = {
        ...editData,
        interesses: editData.interesses
          .split(",")
          .map((item) => item.trim())
          .filter((item) => item),
      };
      const response = await userService.updateProfile(dataToUpdate);
      if (response.success) {
        setProfileData(response.data);
        setUser(response.data); 
        localStorage.setItem("user", JSON.stringify(response.data)); 
        setSuccessMessage(response.message || "Perfil atualizado com sucesso!");
        setIsEditing(false); 
      } else {
        throw new Error(response.error?.message || "Erro ao atualizar perfil.");
      }
    } catch (err) {
      setError(err.message || "Falha ao atualizar perfil.");
      // Não atualiza o estado nem fecha o formulário em caso de erro
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && !profileData) return <p>Carregando perfil...</p>;
  if (error && !profileData) return <p className="text-red-500">{error}</p>;
  if (!profileData) return <p>Não foi possível carregar o perfil.</p>;

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4 text-gray-700">Meu Perfil</h2>
      <p className="text-sm text-gray-600 mb-4">
        Para manter seus dados atualizados ou corrigir qualquer informação, por
        favor, utilize o botão de edição abaixo. Se precisar alterar seu
        endereço de e-mail, entre em contato com o suporte do projeto.
      </p>
      {successMessage && (
        <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4">
          {successMessage}
        </p>
      )}
      {error && !successMessage && (
        <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>
      )}

      {!isEditing ? (
        // Modo de Visualização
        <div className="space-y-3">
          <p>
            <strong>Nome:</strong> {profileData.nomeCompleto}
          </p>
          <p>
            <strong>Email:</strong> {profileData.email}
          </p>
          <p>
            <strong>Telefone:</strong> {profileData.telefone || "Não informado"}
          </p>
          <p>
            <strong>Data de Nascimento:</strong>{" "}
            {profileData.dataNascimento
              ? new Date(profileData.dataNascimento).toLocaleDateString("pt-BR")
              : "Não informada"}
          </p>
          <p>
            <strong>Escola:</strong> {profileData.escola || "Não informada"}
          </p>
          <p>
            <strong>Série/Ano:</strong>{" "}
            {profileData.serieAno || "Não informado"}
          </p>{" "}
          <p>
            <strong>Interesses:</strong>{" "}
            {Array.isArray(profileData.interesses) &&
            profileData.interesses.length > 0
              ? profileData.interesses.join(", ")
              : "Não informados"}
          </p>
          <button
            onClick={() => {
              setIsEditing(true);
              setSuccessMessage("");
              setError("");
            }}
            className="mt-4 px-4 py-2 bg-brandPurple-700 text-white rounded-md hover:bg-brandPurple-800"
          >
            Editar Perfil
          </button>
        </div>
      ) : (
        // Modo de Edição
        <form onSubmit={handleSubmitEdit} className="space-y-4">
          <div>
            <label
              htmlFor="nomeCompleto"
              className="block text-sm font-medium text-gray-700"
            >
              Nome Completo
            </label>
            <input
              type="text"
              name="nomeCompleto"
              id="nomeCompleto"
              value={editData.nomeCompleto}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm"
            />
          </div>
          {/* Adicione outros campos editáveis: telefone, escola, serieAno, interesses */}
          <div>
            <label
              htmlFor="telefone"
              className="block text-sm font-medium text-gray-700"
            >
              Telefone
            </label>
            <input
              type="tel"
              name="telefone"
              id="telefone"
              value={editData.telefone}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="escola"
              className="block text-sm font-medium text-gray-700"
            >
              Escola
            </label>
            <input
              type="text"
              name="escola"
              id="escola"
              value={editData.escola}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="serieAno"
              className="block text-sm font-medium text-gray-700"
            >
              Série/Ano
            </label>
            <input
              type="text"
              name="serieAno"
              id="serieAno"
              value={editData.serieAno}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm"
            />
          </div>
          <div>
            <label
              htmlFor="interesses"
              className="block text-sm font-medium text-gray-700"
            >
              Interesses (separados por vírgula)
            </label>
            <input
              type="text"
              name="interesses"
              id="interesses"
              value={editData.interesses}
              onChange={handleChange}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm"
            />
          </div>

          <div className="flex space-x-3">
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-brandPurple-700 text-white rounded-md hover:bg-brandPurple-800 disabled:opacity-50"
            >
              {isLoading ? "Salvando..." : "Salvar Alterações"}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsEditing(false);
                setSuccessMessage("");
                setError("");
              }}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              Cancelar
            </button>
          </div>
        </form>
      )}
      <div className="mt-10 pt-6 border-t border-dashed border-red-300">
        <h3 className="text-lg font-semibold text-red-700 mb-2">
          Gerenciamento da Conta
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          A exclusão da sua conta é uma ação permanente e removerá seus dados
          pessoais associados ao projeto Meninas Digitais UTFPR-CP, conforme
          nossa Política de Privacidade. Suas inscrições em atividades futuras
          serão canceladas.
        </p>
        <button
          onClick={openDeleteAccountModal}
          className={`px-4 py-2 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
            user?.role === "superadmin"
              ? "bg-red-300 cursor-not-allowed"
              : "bg-red-600 hover:bg-red-700"
          }`}
          disabled={user?.role === "superadmin"}
        >
          Excluir Minha Conta
        </button>
        {user?.role === "superadmin" && (
          <p className="text-sm text-yellow-700 mt-2 bg-yellow-50 p-2 rounded">
            Super administradores não podem excluir suas próprias contas.
          </p>
        )}
        <Modal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteAccountModal}
          title="Confirmar Exclusão de Conta"
          onConfirm={handleConfirmDeleteAccount}
          confirmText="Sim, Excluir Minha Conta"
          cancelText="Não, Manter Minha Conta"
          isConfirming={isDeletingAccount}
        >
          <p className="text-gray-700">
            Você tem certeza que deseja excluir permanentemente sua conta?
          </p>
          <p className="text-sm text-red-700 mt-2">
            Todos os seus dados pessoais e histórico de inscrições associados ao
            projeto Meninas Digitais UTFPR-CP serão removidos ou anonimizados.
            Esta ação não poderá ser desfeita.
          </p>
          {deleteAccountError && (
            <p className="text-red-500 text-sm mt-3 bg-red-50 p-2 rounded">
              {deleteAccountError}
            </p>
          )}
        </Modal>
      </div>
    </div>
  );
};

export default MeuPerfilPage;