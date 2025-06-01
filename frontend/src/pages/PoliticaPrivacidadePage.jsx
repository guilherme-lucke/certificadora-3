const PoliticaPrivacidadePage = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold font-poppins mb-6 text-text-default">
        Política de Privacidade - Meninas Digitais UTFPR-CP
      </h1>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold font-poppins mb-3 text-text-default">
          1. Introdução
        </h2>
        <p className="text-text-muted leading-relaxed">
          Bem-vindo(a) à Política de Privacidade do projeto de extensão Meninas
          Digitais – UTFPR-CP. Esta política descreve como coletamos, usamos,
          compartilhamos e protegemos suas informações pessoais quando você
          utiliza nossa plataforma e participa de nossas atividades. Nosso
          compromisso é garantir a transparência e a segurança dos seus dados,
          em conformidade com a Lei Geral de Proteção de Dados Pessoais (LGPD),
          Lei nº 13.709/2018.
        </p>
      </section>{" "}
      <section className="mb-6">
        <h2 className="text-2xl font-semibold font-poppins mb-3 text-text-default">
          2. Informações que Coletamos e Suas Finalidades
        </h2>
        <p className="text-text-muted leading-relaxed mb-2">
          Coletamos informações pessoais que você nos fornece diretamente ao se
          cadastrar em nossa plataforma ou em nossas atividades. Para cada
          informação coletada, explicamos sua finalidade específica:
        </p>
        <ul className="list-disc list-inside text-text-muted leading-relaxed ml-4">
          <li className="mb-2">
            <strong className="text-text-default">Nome completo:</strong>{" "}
            Utilizado para sua identificação nas atividades, emissão de
            certificados e comunicação personalizada;
          </li>
          <li className="mb-2">
            <strong className="text-text-default">Endereço de e-mail:</strong>{" "}
            Necessário para envio de informações sobre as atividades inscritas,
            novidades do projeto e comunicações importantes;
          </li>
          <li className="mb-2">
            <strong className="text-text-default">Número de telefone:</strong>{" "}
            Usado apenas para comunicações urgentes relacionadas às atividades
            em que você está inscrita;
          </li>
          <li className="mb-2">
            <strong className="text-text-default">Data de nascimento:</strong>{" "}
            Necessária para garantir a adequação das atividades à sua faixa
            etária e para análises estatísticas do projeto;
          </li>
          <li className="mb-2">
            <strong className="text-text-default">Nome da escola:</strong>{" "}
            Utilizado para mapeamento da abrangência do projeto e adaptação das
            atividades ao contexto educacional;
          </li>
          <li className="mb-2">
            <strong className="text-text-default">Série/ano escolar:</strong>{" "}
            Necessário para adequar o conteúdo das atividades ao seu nível
            educacional;
          </li>
          <li className="mb-2">
            <strong className="text-text-default">Áreas de interesse:</strong>{" "}
            Utilizadas para personalizar sua experiência e recomendar atividades
            mais relevantes para você.
          </li>
        </ul>
        <p className="text-text-muted leading-relaxed mt-4">
          Todos os dados são coletados com base no seu consentimento e são
          essenciais para proporcionar uma experiência educacional adequada e
          personalizada. Você pode atualizar ou solicitar a exclusão desses
          dados a qualquer momento através do seu perfil ou entrando em contato
          conosco.
        </p>
        <p className="text-text-muted leading-relaxed mt-2">
          Também coletamos informações automaticamente quando você navega em
          nosso site, como endereço IP, tipo de navegador, páginas visitadas e
          horários de acesso, através de cookies e tecnologias similares. Estes
          dados são utilizados exclusivamente para melhorar a experiência de
          navegação e a segurança da plataforma, sempre com seu consentimento
          prévio para cookies não essenciais.
        </p>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold font-poppins mb-3 text-text-default">
          3. Como Usamos Suas Informações
        </h2>
        <p className="text-text-muted leading-relaxed mb-2">
          As informações coletadas são utilizadas para as seguintes finalidades:
        </p>
        <ul className="list-disc list-inside text-text-muted leading-relaxed ml-4">
          <li>
            Gerenciar sua inscrição e participação nas atividades do projeto;
          </li>
          <li>
            Comunicar informações importantes sobre o projeto, eventos e
            oportunidades;
          </li>
          <li>Personalizar sua experiência e fornecer conteúdo relevante;</li>
          <li>Melhorar nossa plataforma e os serviços oferecidos;</li>
          <li>
            Realizar pesquisas e análises estatísticas (de forma anonimizada ou
            agregada);
          </li>
          <li>Cumprir obrigações legais e regulatórias.</li>
        </ul>
      </section>
      <section className="mb-6">
        <h2 className="text-2xl font-semibold font-poppins mb-3 text-text-default">
          10. Contato
        </h2>
        <p className="text-text-muted leading-relaxed">
          Se você tiver alguma dúvida sobre esta Política de Privacidade ou
          sobre como tratamos seus dados, entre em contato conosco através do
          e-mail:{" "}
          <a
            href="mailto:meninasdigitais-cp@utfpr.edu.br"
            className="text-primary hover:text-primary-dark hover:underline"
          >
            meninasdigitais-cp@utfpr.edu.br
          </a>{" "}
          (este e-mail é um exemplo).
        </p>
      </section>{" "}
      <p className="text-sm text-text-muted mt-8">
        Última atualização: 30 de maio de 2025
      </p>
    </div>
  );
};

export default PoliticaPrivacidadePage;