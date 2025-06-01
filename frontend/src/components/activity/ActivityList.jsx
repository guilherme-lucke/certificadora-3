import React from "react";
import ActivityCard from "./ActivityCard";

const ActivityList = ({
  activities,
  isLoading,
  error,
  onEnrollmentSuccess,
}) => {
  if (isLoading) {
    return (
      <p className="text-center text-text-muted">Carregando atividades...</p>
    );
  }

  if (error) {
    return (
      <p className="text-center text-error">
        Erro ao carregar atividades: {error.message || error}
      </p>
    );
  }

  if (!activities || activities.length === 0) {
    return (
      <p className="text-center text-text-muted">
        Nenhuma atividade aberta no momento. Volte em breve!
      </p>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {activities.map((activity) => (
        <ActivityCard
          key={activity.id || activity._id}
          activity={activity}
          onEnrollmentSuccess={onEnrollmentSuccess}
        />
      ))}
    </div>
  );
};

export default ActivityList;