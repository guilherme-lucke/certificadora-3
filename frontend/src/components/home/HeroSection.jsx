import React from "react";



const HeroSection = () => {
  return (
    // Container principal da seção Hero
    <section className="bg-gradient-to-r from-brandPurple-700 via-brandPink-600 to-brandOrange-500 text-text-inverted py-20 md:py-32">
      {" "}
      <div className="container mx-auto px-4 text-center">
        {/* Título Principal */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-poppins mb-6 leading-tight">
          Empoderando Meninas Através da Tecnologia
        </h1>

        <p className="text-lg md:text-xl lg:text-2xl mb-8 max-w-3xl mx-auto text-text-inverted opacity-90">
          O Meninas Digitais UTFPR-CP incentiva e apoia estudantes do ensino
          fundamental e médio a seguirem carreiras em STEM, com foco em
          computação e impacto social.
        </p>

        <a
          href="#atividades"
          className="bg-white text-primary font-semibold py-3 px-8 rounded-lg
                     hover:bg-gray-200 transition duration-300 ease-in-out
                     text-lg shadow-md hover:shadow-lg transform hover:scale-105"
        >
          Ver Atividades Abertas
        </a>
      </div>
    </section>
  );
};

export default HeroSection;