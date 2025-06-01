import React, { useState, useEffect } from "react";
import inscriptionService from "../../services/inscriptionService";
import { formatDate } from "../../utils/formatters";

const HistoricoAtividadesPage = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchHistory = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // A API deve retornar um array de inscrições passadas ou atividades participadas
        // Cada item deve ter detalhes da atividade e, possivelmente, o status final da participação.
        const data = await inscriptionService.getMyInscriptionHistory();
        setHistory(data || []);
      } catch (err) {
        console.error("Erro ao buscar histórico de atividades:", err);
        setError(err.message || "Falha ao carregar seu histórico.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []); // Busca ao montar

  if (isLoading) {
    return <p className="text-center text-gray-500">Carregando histórico...</p>;
  }

  if (error) {
    return <p className="text-center text-red-500">Erro: {error}</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">
        Histórico de Atividades
      </h2>

      {history.length === 0 ? (
        <p className="text-gray-600">
          Você ainda não tem histórico de participação em atividades.
        </p>
      ) : (
        <div className="space-y-4">
          {history.map((entry) => (
            <div
              key={
                entry.id ||
                entry._id ||
                entry.activity?.id ||
                entry.activity?._id
              }
              className="bg-white p-4 shadow rounded-lg border border-gray-200"
            >
              {entry.activity ? (
                <>
                  <h3 className="text-lg font-semibold text-brandPurple-700 mb-1">
                    {entry.activity.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <strong>Data da Atividade:</strong>{" "}
                    {formatDate(entry.activity.dataHoraInicio, true)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Tipo:</strong> {entry.activity.tipo}
                  </p>
                  {/* Poderia mostrar o status final da atividade ou da participação aqui */}
                  {entry.activity.status && ( 
                    <p className="text-sm text-gray-500 mt-1">
                      Status da Atividade:{" "}
                      <span className="font-medium">
                        {entry.activity.status}
                      </span>
                    </p>
                  )}
                </>
              ) : (
                <p className="text-red-500">
                  Dados da atividade não disponíveis para esta entrada do
                  histórico.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default HistoricoAtividadesPage;