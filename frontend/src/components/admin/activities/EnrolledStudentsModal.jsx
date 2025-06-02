import React from "react";

const EnrolledStudentsModal = ({
  isOpen,
  onClose,
  activityName,
  enrollments,
  isLoading,
  error,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center p-4 z-50"
      onClick={onClose} // Fecha ao clicar fora do conteúdo do modal
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" // Aumentado max-w-3xl
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        {/* Cabeçalho do Modal */}
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-800">
            {`Estudantes Inscritos em "${activityName}" (${
              enrollments?.length || 0
            })`}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
            aria-label="Fechar modal"
          >
            &times; {/* Caractere 'X' */}
          </button>
        </div>

        {/* Conteúdo do Modal */}
        <div className="p-6 overflow-y-auto">
          {isLoading ? (
            <p className="text-center text-gray-500">Carregando inscritos...</p>
          ) : error ? (
            <p className="text-center text-red-500">
              Erro ao carregar inscritos: {error}
            </p>
          ) : enrollments && enrollments.length === 0 ? (
            <p className="text-gray-600">
              Nenhum estudante inscrito nesta atividade ainda.
            </p>
          ) : (
            <div className="overflow-x-auto bg-white rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50 sticky top-0 z-10">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Nome Completo
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Escola
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Série/Ano
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Data Inscrição
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {enrollments?.map((enrollment) => (
                    <tr
                      key={
                        enrollment.inscriptionId ||
                        enrollment.student?.id ||
                        enrollment.student?._id
                      }
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {enrollment.student?.nomeCompleto || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enrollment.student?.email || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enrollment.student?.escola || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enrollment.student?.serieAno || "N/A"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {enrollment.dataInscricao
                          ? new Date(
                              enrollment.dataInscricao
                            ).toLocaleDateString("pt-BR", {
                              day: "2-digit",
                              month: "2-digit",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "N/A"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnrolledStudentsModal;
