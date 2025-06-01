import React, { useState, useEffect } from "react";
import HeroSection from "../components/home/HeroSection"
import ActivityList from "../components/activity/ActivityList";
import publicActivityService from "../services/publicActivityServic";
import { TIPOS_ATIVIDADE_FILTRO } from "../utils/constants";

const HomePage = () => {
  const [allActivities, setAllActivities] = useState([]); 
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedType, setSelectedType] = useState(""); 
  const [currentPage, setCurrentPage] = useState(1);
  const activitiesPerPage = 6; 

  useEffect(() => {
    const fetchActivities = async (filterType) => {
      try {
        setIsLoading(true);
        setError(null);
        const params = filterType ? { tipo: filterType } : {};
        const fetchedActivities =
          await publicActivityService.getPublicActivities(params);
        setAllActivities(fetchedActivities); // Armazena todas as atividades
        setCurrentPage(1); // Reseta para a primeira página ao buscar novas atividades
      } catch (err) {
        console.error("HomePage - Erro ao buscar atividades:", err);
        setError(err); // Armazena o objeto de erro completo
      } finally {
        setIsLoading(false);
      }
    };

    fetchActivities(selectedType);
  }, [selectedType]); // Adiciona selectedType como dependência

  const handleFilterChange = (event) => {
    setSelectedType(event.target.value);
  };

  const handleEnrollmentSuccessInCard = (enrolledActivityId) => {
    console.log(
      `Inscrição bem-sucedida para atividade ${enrolledActivityId} reportada pelo card.`
    );
    setAllActivities((prevActivities) =>
      prevActivities.map((act) => {
        if ((act.id || act._id) === enrolledActivityId) {
          return {
            ...act,
            vagasDisponiveis: Math.max(0, act.vagasDisponiveis - 1), 
          };
        }
        return act;
      })
    );
  };

  // Lógica de Paginação
  const indexOfLastActivity = currentPage * activitiesPerPage;
  const indexOfFirstActivity = indexOfLastActivity - activitiesPerPage;
  const currentActivities = allActivities.slice(
    indexOfFirstActivity,
    indexOfLastActivity
  );
  const totalPages = Math.ceil(allActivities.length / activitiesPerPage);

  const paginate = (pageNumber) => {
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setCurrentPage(pageNumber);
      // Opcional: rolar para o topo da seção de atividades ao mudar de página
      const atividadesSection = document.getElementById("atividades");
      if (atividadesSection) {
        atividadesSection.scrollIntoView({ behavior: "smooth" });
      }
    }
  };

  return (
    <div>
      <HeroSection />

      <section id="atividades" className="py-12 bg-bg-surface">
        {" "}
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold font-poppins text-center mb-12 text-text-default">
            Próximas Atividades
          </h2>

          {/* Controle de Filtro */}
          <div className="mb-8 flex justify-center md:justify-end">
            <div className="w-full md:w-1/3 lg:w-1/4">
              <label htmlFor="activityTypeFilter" className="sr-only">
                Filtrar por tipo
              </label>
              <select
                id="activityTypeFilter"
                name="activityTypeFilter"
                value={selectedType}
                onChange={handleFilterChange}
                className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm rounded-md shadow-sm"
              >
                {TIPOS_ATIVIDADE_FILTRO.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <ActivityList
            activities={currentActivities} // Passado apenas as atividades da página atual
            isLoading={isLoading && allActivities.length === 0} 
            error={error}
            onEnrollmentSuccess={handleEnrollmentSuccessInCard} 
          />

          {totalPages > 1 && (
            <div className="mt-8 flex justify-center items-center space-x-2">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-sm text-gray-700">
                Página {currentPage} de {totalPages}
              </span>
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </div>
      </section>

    </div>
  );
};

export default HomePage;