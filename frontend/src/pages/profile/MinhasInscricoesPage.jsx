import React, { useState, useEffect } from "react";
import inscriptionService from "../../services/inscriptionService";
import Modal from "../../components/common/Modal";
import { formatDate } from "../../utils/formatters";

const MinhasInscricoesPage = () => {
  const [myInscriptions, setMyInscriptions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [inscriptionToCancel, setInscriptionToCancel] = useState(null);
  const [isCancelling, setIsCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");
  const [cancelSuccessMessage, setCancelSuccessMessage] = useState(""); 

  useEffect(() => {
    const fetchInscriptions = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await inscriptionService.getMyInscriptions();
        setMyInscriptions(data || []);
      } catch (err) {
        console.error("Erro ao buscar minhas inscrições:", err);
        setError(err.message || "Falha ao carregar suas inscrições.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchInscriptions();
  }, []); // Busca ao montar

  const openCancelModal = (inscription) => {
    setInscriptionToCancel(inscription);
    setIsCancelModalOpen(true);
    setCancelError("");
    setCancelSuccessMessage("");
  };

  const closeCancelModal = () => {
    setIsCancelModalOpen(false);
    setInscriptionToCancel(null);
  };

  const handleConfirmCancel = async () => {
    if (!inscriptionToCancel) return;

    setIsCancelling(true);
    setCancelError("");
    setCancelSuccessMessage("");
    try {
      const inscriptionId = inscriptionToCancel.id || inscriptionToCancel._id;
      const response = await inscriptionService.cancelMyInscription(
        inscriptionId
      );

      if (response.success) {
        setCancelSuccessMessage(
          response.message || "Inscrição cancelada com sucesso!"
        );

        // Atualizar a lista de inscrições atualizando o status
        setMyInscriptions((prevInscriptions) =>
          prevInscriptions.map((insc) =>
            (insc.id || insc._id) === inscriptionId
              ? { ...insc, statusInscricao: "CanceladaPeloEstudante" }
              : insc
          )
        );
      } else {
        // Erro da API com success: false (ex: prazo expirado, tratado pelo backend)
        setCancelError(
          response.error?.message || "Erro ao cancelar inscrição."
        );
      }
    } catch (err) {
      console.error("Erro ao cancelar inscrição:", err);
      const errorMessage =
        err.message || "Falha ao cancelar inscrição. Tente novamente.";
      setCancelError(errorMessage);
    } finally {
      setIsCancelling(false);
      closeCancelModal();
    }
  };

  if (isLoading) {
    return (
      <p className="text-center text-gray-500">Carregando suas inscrições...</p>
    );
  }

  if (error) {
    return <p className="text-center text-red-500">Erro: {error}</p>;
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-6 text-gray-700">
        Minhas Inscrições
      </h2>

      {myInscriptions.length === 0 ? (
        <p className="text-gray-600">
          Você ainda não se inscreveu em nenhuma atividade.{" "}
        </p>
      ) : (
        <div className="space-y-6">
          {myInscriptions.map((inscription) => (
            <div
              key={inscription.id || inscription._id} 
              className="bg-white p-4 shadow rounded-lg border border-gray-200"
            >
              {inscription.activity ? (
                <>
                  <h3 className="text-lg font-semibold text-brandPurple-700 mb-1">
                    {inscription.activity.nome}
                  </h3>
                  <p className="text-sm text-gray-600">
                    <strong>Data da Atividade:</strong>{" "}
                    {formatDate(inscription.activity.dataHoraInicio, true)}
                  </p>
                  <p className="text-sm text-gray-600">
                    <strong>Local:</strong> {inscription.activity.local}
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    Data da Inscrição: {formatDate(inscription.dataInscricao)}
                  </p>
                  <p className="text-sm font-medium mt-1">
                    Status:{" "}
                    <span className="text-green-600">
                      {inscription.statusInscricao}
                    </span>
                  </p>

                  {/* Lógica do Botão de Cancelamento */}
                  {inscription.statusInscricao === "Confirmada" && 
                    (() => {
                      let canCancel = true; 
                      if (inscription.activity?.dataLimiteCancelamento) {
                        const deadline = new Date(
                          inscription.activity.dataLimiteCancelamento
                        );
                        const now = new Date();
                        if (now > deadline) {
                          canCancel = false;
                        }
                      }


                      if (!canCancel) {
                        return (
                          <p className="mt-3 text-sm text-gray-500">
                            Prazo para cancelamento expirado em{" "}
                            {formatDate(
                              inscription.activity.dataLimiteCancelamento
                            )}
                            .
                          </p>
                        );
                      }

                      return (
                        <button
                          onClick={() => openCancelModal(inscription)}
                          className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium disabled:text-gray-400 disabled:cursor-not-allowed"
                          disabled={!canCancel}
                        >
                          {isCancelling &&
                          inscriptionToCancel &&
                          (inscriptionToCancel.id ||
                            inscriptionToCancel._id) ===
                            (inscription.id || inscription._id)
                            ? "Cancelando..."
                            : "Cancelar Inscrição"}
                        </button>
                      );
                    })()}
                </>
              ) : (
                <p className="text-red-500">
                  Dados da atividade não disponíveis.
                </p>
              )}
            </div>
          ))}
        </div>
      )}
      <Modal
        isOpen={isCancelModalOpen}
        onClose={closeCancelModal}
        title="Confirmar Cancelamento"
        onConfirm={handleConfirmCancel}
        confirmText="Sim, Cancelar Inscrição"
        cancelText="Manter Inscrição"
        isConfirming={isCancelling}
      >
        <p>
          Tem certeza que deseja cancelar sua inscrição na atividade{" "}
          <strong>"{inscriptionToCancel?.activity?.nome}"</strong>?
        </p>
        {cancelError && (
          <p className="text-red-500 text-sm mt-2">{cancelError}</p>
        )}
      </Modal>

      {cancelSuccessMessage && !isCancelModalOpen && (
        <div
          className="fixed bottom-4 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded-md shadow-lg"
          role="alert"
        >
          <p className="font-bold">Sucesso!</p>
          <p>{cancelSuccessMessage}</p>
        </div>
      )}
    </div>
  );
};

export default MinhasInscricoesPage;