import React, { useState } from "react";
import userService from "../../services/userService";

const AlterarSenhaPage = () => {
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmNewPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setPasswordData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (passwordData.newPassword !== passwordData.confirmNewPassword) {
      setError("A nova senha e a confirmação não coincidem.");
      return;
    }
    // Adicionar validação de força da nova senha se desejado (no cliente)

    setIsLoading(true);
    try {
      const response = await userService.changePassword({
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      if (response.success) {
        setSuccessMessage(response.message || "Senha alterada com sucesso!");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmNewPassword: "",
        }); // Limpa o formulário
      } else {
        setError(response.error?.message || "Erro ao alterar senha.");
      }
    } catch (err) {
      setError(
        err.error?.message ||
          "Falha ao alterar senha. Verifique sua senha atual."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">
        Alterar Senha
      </h2>
      {successMessage && (
        <p className="text-green-600 bg-green-100 p-3 rounded-md mb-4">
          {successMessage}
        </p>
      )}
      {error && (
        <p className="text-red-600 bg-red-100 p-3 rounded-md mb-4">{error}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
        <div>
          <label
            htmlFor="currentPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Senha Atual
          </label>
          <input
            type="password"
            name="currentPassword"
            id="currentPassword"
            value={passwordData.currentPassword}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="newPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Nova Senha
          </label>
          <input
            type="password"
            name="newPassword"
            id="newPassword"
            value={passwordData.newPassword}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm"
          />
        </div>
        <div>
          <label
            htmlFor="confirmNewPassword"
            className="block text-sm font-medium text-gray-700"
          >
            Confirmar Nova Senha
          </label>
          <input
            type="password"
            name="confirmNewPassword"
            id="confirmNewPassword"
            value={passwordData.confirmNewPassword}
            onChange={handleChange}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-brandPurple-500 focus:border-brandPurple-500 sm:text-sm"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full px-4 py-2 bg-brandPurple-700 text-white rounded-md hover:bg-brandPurple-800 disabled:opacity-50"
          >
            {isLoading ? "Alterando..." : "Alterar Senha"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AlterarSenhaPage;