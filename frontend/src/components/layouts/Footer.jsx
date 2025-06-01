import React from "react";
import { Link } from "react-router-dom";
import logoIdv from "../../assets/logo-idv.png"; 


const Footer = () => {
  const currentYear = new Date().getFullYear();
  const instagramUser = "meninasdigitaisutfprcp"; // Para facilitar a construção do link
  const sbcPortfolioLink =
    "https://meninas.sbc.org.br/portfolio-3/meninas-digitais-utfpr-cp/"; 
  const linkedInPageName = "meninas-digitais-utfpr-cp"; 
  const contactEmail = "contato@meninasdigitaisutfprcp.example.com";

  return (
    <footer className="bg-primary-dark text-text-inverted pt-12 pb-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col gap-8 md:flex-row md:justify-evenly mb-8">
          {/* Coluna 0: Logo e Nome */}
          <div className="flex flex-col items-center">
            {" "}
            <img
              src={logoIdv}
              alt="Logo Meninas Digitais UTFPR-CP"
              className="h-20 mb-2" 
            />
            <p className="text-center text-lg font-semibold font-poppins text-white mb-3">
              {" "}
              MENINAS DIGITAIS <br /> UTFPR-CP
            </p>
          </div>

          <div>
            <h3 className="text-lg font-semibold font-poppins text-white mb-3">
              Links Úteis
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  to="/atividades"
                  className="hover:opacity-80 hover:underline"
                >
                  {" "}
                  Ver Atividades
                </Link>
              </li>
              <li>
                <Link
                  to="/politica-de-privacidade"
                  className="hover:opacity-80 hover:underline"
                >
                  Política de Privacidade
                </Link>
              </li>
              <li>
                <a
                  href={sbcPortfolioLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 hover:underline"
                >
                  Portfólio Meninas SBC
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold font-poppins text-white mb-3">
              Onde nos encontrar
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`https://www.instagram.com/${instagramUser}/`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 hover:underline flex items-center"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={`https://www.linkedin.com/company/${linkedInPageName}`} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:opacity-80 hover:underline flex items-center"
                >
                  LinkedIn
                </a>
              </li>
              {contactEmail && (
                <li>
                  <a
                    href={`mailto:${contactEmail}`}
                    className="hover:opacity-80 hover:underline flex items-center"
                  >
                    {contactEmail}
                  </a>
                </li>
              )}
            </ul>
          </div>
        </div>

        <div className="border-t border-brandPurple-700 pt-8 text-center text-sm">
          <p>
            © {currentYear} Meninas Digitais UTFPR-CP. Todos os direitos
            reservados.
          </p>
          <p className="mt-1">Desenvolvido com ❤️ pelo Grupo 4.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;