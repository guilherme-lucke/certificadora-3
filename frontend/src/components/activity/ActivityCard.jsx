import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext"; 
import inscriptionService from "../../services/inscriptionService";

const ActivityCard = ({ activity: initialActivity, onEnrollmentSuccess }) => {
  const [activity, setActivity] = useState(initialActivity);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [enrollError, setEnrollError] = useState("");

  const { isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  if (!activity) return null;

  const agora = new Date();
  const periodoInscricaoInicio = new Date(activity.periodoInscricaoInicio);
  const periodoInscricaoFim = new Date(activity.periodoInscricaoFim);

  const formatDate = (dateString, includeTime = true) => {
    if (!dateString) return "Data não definida";
    const options = {
      year: "numeric",
      month: "long",
      day: "numeric",
      ...(includeTime && { hour: "2-digit", minute: "2-digit" }),
    };
    return new Date(dateString).toLocaleDateString("pt-BR", options);
  };

  let buttonText = "Inscrever-se";
  let buttonDisabled = false;
  let inscriptionMessage = "";

  if (activity.isEnrolled) {
    buttonText = "Inscrito ✔";
    buttonDisabled = true;
  } else if (activity.status === "Vagas Esgotadas") {
    buttonText = "Vagas Esgotadas";
    buttonDisabled = true;
  } else if (activity.status === "Inscrições Encerradas") {
    buttonText = "Inscrições Encerradas";
    buttonDisabled = true;
  } else if (activity.status === "Realizada") {
    buttonText = "Atividade Realizada";
    buttonDisabled = true;
  } else if (activity.status === "Cancelada") {
    buttonText = "Atividade Cancelada";
    buttonDisabled = true;
  } else if (
    activity.status === "Publicada" &&
    agora < periodoInscricaoInicio
  ) {
    buttonText = "Inscrições em Breve";
    buttonDisabled = true;
    inscriptionMessage = `Inscrições abrem em ${formatDate(
      activity.periodoInscricaoInicio
    )}.`;
  } else if (
    activity.status === "Inscrições Abertas" ||
    (activity.status === "Publicada" &&
      agora >= periodoInscricaoInicio &&
      agora <= periodoInscricaoFim)
  ) {
    if (activity.vagasDisponiveis <= 0) {
      buttonText = "Vagas Esgotadas";
      buttonDisabled = true;
    } else {
      buttonText = "Inscrever-se";
      buttonDisabled = false;
      inscriptionMessage = `Inscrições encerram em: ${formatDate(
        activity.periodoInscricaoFim
      )}.`;
    }
  } else {

    buttonText = "Indisponível";
    buttonDisabled = true;
    if (activity.status === "Publicada" && agora > periodoInscricaoFim) {
      inscriptionMessage = "Período de inscrição encerrado.";
    }
  }

  if (isEnrolling) {
    buttonText = "Inscrevendo...";
    buttonDisabled = true;
  }

  const handleEnroll = async (e) => {
    e.preventDefault();

    if (!isAuthenticated) {
      // Redirecionar para login com o caminho atual como state
      navigate("/login", {
        state: { from: location.pathname },
      });
      return;
    }

    if (user.role !== "estudante") {
      alert("Apenas estudantes podem se inscrever em atividades.");
      return;
    }

    if (activity.vagasDisponiveis <= 0 || activity.isEnrolled) {
      return;
    }

    setIsEnrolling(true);
    setEnrollError("");
    // setEnrollSuccess("");

    try {
      const response = await inscriptionService.enrollInActivity(
        activity.id || activity._id
      );
      if (response.success) {
        alert(response.message || "Inscrição realizada com sucesso!");

        // Atualizar o estado local da atividade no card
        setActivity((prevActivity) => ({
          ...prevActivity,
          vagasDisponiveis: prevActivity.vagasDisponiveis - 1,
          isEnrolled: true, 
        }));

        // Notificar a HomePage para que ela possa atualizar a contagem global de vagas
        if (onEnrollmentSuccess) {
          onEnrollmentSuccess(activity.id || activity._id);
        }
      } else {
        setEnrollError(
          response.error?.message || "Falha ao realizar inscrição."
        );
      }
    } catch (err) {
      console.error("Erro ao inscrever na atividade:", err);
      setEnrollError(
        err.message ||
          "Ocorreu um erro ao tentar se inscrever. Tente novamente."
      );
    } finally {
      setIsEnrolling(false);
    }
  };

  return (
    <div className="bg-bg-default rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:scale-105">
      <div className="p-6">
        <h3 className="text-xl font-semibold font-poppins text-text-default mb-2">
          {activity.nome}
        </h3>
        <p className="text-sm text-secondary font-medium mb-1">
          {activity.tipo}
        </p>
        <p className="text-text-muted text-sm mb-3 leading-relaxed">
          {activity.descricao}
        </p>
        <div className="text-sm text-text-muted mb-4">
          <p>
            <strong>Data:</strong> {formatDate(activity.dataHoraInicio)}
          </p>{" "}
          <p>
            <strong>Local:</strong> {activity.local}
          </p>
          <p>
            <strong>Vagas Disponíveis:</strong>{" "}
            {activity.vagasDisponiveis > 0
              ? activity.vagasDisponiveis
              : "Esgotadas"}
          </p>
        </div>
        {enrollError && (
          <p className="text-sm text-error mt-2 mb-2">{enrollError}</p>
        )}
        {inscriptionMessage && (
          <p className="text-sm text-info mt-2 mb-2">{inscriptionMessage}</p>
        )}

        <button
          onClick={handleEnroll}
          disabled={buttonDisabled || isEnrolling}
          className={`mt-4 inline-block w-full text-center px-4 py-2 rounded-md text-sm font-medium
                transition duration-150 ease-in-out
                ${
                  buttonDisabled || isEnrolling
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-accent text-accent-foreground hover:bg-accent-dark"
                }
                ${isEnrolling ? "opacity-50 cursor-wait" : ""}`}
          aria-disabled={buttonDisabled || isEnrolling}
        >
          {buttonText}
        </button>
      </div>
    </div>
  );
};

export default ActivityCard;