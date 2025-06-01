const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const Activity = require("../../models/Activity"); // Ajuste o caminho conforme necessário
const User = require("../../models/User"); // Ajuste o caminho conforme necessário
const connectDB = require("../db"); // Ajuste o caminho conforme necessário

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const activities = [
  {
    nome: "Oficina de Introdução à Programação com Scratch", // ATIVIDADE 4 (Inscrita - Inscrições Abertas)
    tipo: "Oficina",
    descricao:
      "Aprenda os conceitos básicos de programação de forma divertida e interativa com a plataforma Scratch. Ideal para iniciantes!",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 7)).setHours(
        14,
        0,
        0,
        0
      )
    ), // hoje + 7 dias, 14:00
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 7)).setHours(
        17,
        0,
        0,
        0
      )
    ), // dataHoraInicio + 3 horas
    local: "Online",
    linkOnline: "https://meet.google.com/example-scratch-workshop",
    vagasTotal: 30,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 2)).setHours(
        9,
        0,
        0,
        0
      )
    ), // hoje - 2 dias, 09:00 (para garantir que esteja aberta)
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 5)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje + 7) - 2 dias = hoje + 5
    dataLimiteCancelamento: new Date(
      new Date(new Date().setDate(new Date().getDate() + 5)).setHours(
        23,
        59,
        0,
        0
      )
    ), // Mesmo que periodoInscricaoFim
    status: "Inscrições Abertas",
  },
  {
    nome: "Roda de Conversa: Mulheres na Tecnologia", // ATIVIDADE 8 (Home - Inscrições Futuras)
    tipo: "Roda de Conversa",
    descricao:
      "Um bate-papo inspirador com mulheres que atuam na área de tecnologia, compartilhando suas experiências e desafios.",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 15)).setHours(
        19,
        0,
        0,
        0
      )
    ), // hoje + 15 dias, 19:00
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 15)).setHours(
        20,
        30,
        0,
        0
      )
    ), // dataHoraInicio + 1.5 horas
    local: "Auditório Principal - UTFPR",
    vagasTotal: 100,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 5)).setHours(
        9,
        0,
        0,
        0
      )
    ), // hoje + 5 dias, 09:00
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 10)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje + 15) - 5 dias = hoje + 10
    status: "Publicada", // Inscrições abrem em breve
  },
  {
    nome: "Minicurso de Desenvolvimento Web Básico: HTML e CSS", // ATIVIDADE 6 (Home - Inscrições Abertas)
    tipo: "Minicurso",
    descricao:
      "Construa suas primeiras páginas web aprendendo os fundamentos de HTML para estrutura e CSS para estilização.",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 20)).setHours(
        9,
        0,
        0,
        0
      )
    ), // hoje + 20 dias, 09:00
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 20)).setHours(
        12,
        0,
        0,
        0
      )
    ), // dataHoraInicio + 3 horas
    local: "Laboratório de Informática 3 - UTFPR",
    vagasTotal: 25,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 3)).setHours(
        9,
        0,
        0,
        0
      )
    ), // hoje - 3 dias, 09:00
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 17)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje + 20) - 3 dias = hoje + 17
    status: "Inscrições Abertas",
  },
  {
    nome: "Mentoria Technovation Girls - Kick-off", // ATIVIDADE 1 (Histórico)
    tipo: "Mentoria Technovation",
    descricao:
      "Sessão inicial para apresentação do programa Technovation Girls, formação de times e primeiros passos no desenvolvimento de aplicativos.",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 10)).setHours(
        10,
        0,
        0,
        0
      )
    ), // hoje - 10 dias, 10:00
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() - 10)).setHours(
        12,
        0,
        0,
        0
      )
    ), // dataHoraInicio + 2 horas
    local: "Online",
    linkOnline: "https://zoom.us/j/example-technovation-kickoff",
    vagasTotal: 50,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 20)).setHours(
        9,
        0,
        0,
        0
      )
    ), // hoje - 20 dias, 09:00
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() - 15)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje - 10) - 5 dias = hoje - 15
    status: "Realizada",
    // inscricoesCount será calculado dinamicamente
  },
  {
    nome: "Palestra: O Futuro da Inteligência Artificial",
    tipo: "Palestra",
    descricao:
      "Explore as últimas tendências e o impacto futuro da Inteligência Artificial em diversas áreas da sociedade.",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 30)).setHours(
        19,
        30,
        0,
        0
      )
    ), // hoje + 30 dias, 19:30
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 30)).setHours(
        21,
        0,
        0,
        0
      )
    ), // dataHoraInicio + 1.5 horas
    local: "Teatro da Universidade",
    vagasTotal: 200,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 10)).setHours(
        9,
        0,
        0,
        0
      )
    ), // hoje + 10 dias, 09:00
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 26)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje + 30) - 4 dias = hoje + 26
    status: "Publicada",
  },
  {
    nome: "Oficina de Robótica com Arduino",
    tipo: "Oficina",
    descricao:
      "Monte e programe seu primeiro robô utilizando a plataforma Arduino. Não é necessário conhecimento prévio.",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 25)).setHours(
        9,
        0,
        0,
        0
      )
    ), // hoje + 25 dias, 09:00
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 25)).setHours(
        13,
        0,
        0,
        0
      )
    ), // dataHoraInicio + 4 horas
    local: "Laboratório de Eletrônica - Bloco Z",
    vagasTotal: 5, // Alterado de 20 para 5
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 3)).setHours(
        0,
        0,
        0,
        0
      )
    ), // hoje + 3 dias, 00:00
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 23)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje + 25) - 2 dias = hoje + 23
    dataLimiteCancelamento: new Date(
      new Date(new Date().setDate(new Date().getDate() + 21)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje + 23) - 2 dias = hoje + 21
    status: "Publicada", // Será alterado para Esgotada implicitamente pelas inscrições
  },
  {
    nome: "Palestra: Cibersegurança para Iniciantes", // ATIVIDADE 2 (Histórico)
    tipo: "Palestra",
    descricao:
      "Entenda os principais conceitos de cibersegurança e como se proteger no mundo digital.",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 15)).setHours(
        19,
        0,
        0,
        0
      )
    ), // hoje - 15 dias, 19:00
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() - 15)).setHours(
        20,
        30,
        0,
        0
      )
    ), // dataHoraInicio + 1.5 horas
    local: "Online",
    linkOnline: "https://example.com/ciberseguranca-realizada",
    vagasTotal: 50,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 25)).setHours(
        0,
        0,
        0,
        0
      )
    ), // hoje - 25 dias, 00:00
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() - 20)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje - 15) - 5 dias = hoje - 20
    status: "Realizada", // Alterado de Cancelada para Realizada
    // inscricoesCount será calculado dinamicamente
  },
  {
    nome: "Hackathon Meninas Digitais 2025",
    tipo: "Outro",
    descricao:
      "Maratona de desenvolvimento de soluções tecnológicas para desafios propostos. Equipes multidisciplinares e muita inovação!",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
        9,
        0,
        0,
        0
      )
    ), // Ontem às 09:00
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
        18,
        0,
        0,
        0
      )
    ), // Ontem às 18:00
    local: "Ginásio Poliesportivo da UTFPR",
    vagasTotal: 100,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 60)).setHours(
        0,
        0,
        0,
        0
      )
    ), // hoje - 60 dias
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() - 15)).setHours(
        23,
        59,
        0,
        0
      )
    ), // hoje - 15 dias
    status: "Realizada",
    // inscricoesCount será calculado dinamicamente
  },
  {
    nome: "Workshop de Design Thinking", // ATIVIDADE 5 (Inscrita - Inscrições Fechadas, Futura)
    tipo: "Oficina",
    descricao:
      "Aprenda a metodologia de Design Thinking para resolver problemas de forma criativa e colaborativa.",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 40)).setHours(
        14,
        0,
        0,
        0
      )
    ), // hoje + 40 dias, 14:00
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 40)).setHours(
        18,
        0,
        0,
        0
      )
    ), // dataHoraInicio + 4 horas
    local: "Sala de Metodologias Ativas",
    vagasTotal: 25,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 10)).setHours(
        0,
        0,
        0,
        0
      )
    ), // hoje - 10 dias, 00:00
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() - 5)).setHours(
        23,
        59,
        0,
        0
      )
    ), // hoje - 5 dias, 23:59
    dataLimiteCancelamento: new Date(
      new Date(new Date().setDate(new Date().getDate() - 7)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje - 5) - 2 dias = hoje - 7
    status: "Inscrições Encerradas",
    // inscricoesCount será calculado dinamicamente
  },
  {
    nome: "Clube do Livro Tech: 'A Menina do Vale'", // ATIVIDADE 7 (Home - Inscrições Abertas)
    tipo: "Roda de Conversa",
    descricao:
      "Discussão sobre o livro 'A Menina do Vale' de Bel Pesce e suas lições sobre empreendedorismo e inovação.",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 10)).setHours(
        18,
        30,
        0,
        0
      )
    ), // hoje + 10 dias, 18:30
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 10)).setHours(
        20,
        0,
        0,
        0
      )
    ), // dataHoraInicio + 1.5 horas
    local: "Biblioteca Central - Espaço Café",
    vagasTotal: 15,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 1)).setHours(
        0,
        0,
        0,
        0
      )
    ), // hoje - 1 dia, 00:00
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 8)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje + 10) - 2 dias = hoje + 8
    dataLimiteCancelamento: new Date(
      new Date(new Date().setDate(new Date().getDate() + 6)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje + 8) - 2 dias = hoje + 6
    status: "Inscrições Abertas",
  },
  {
    nome: "Palestra Extra: Introdução ao Git e GitHub",
    tipo: "Palestra",
    descricao:
      "Aprenda o básico sobre controle de versão com Git e como colaborar em projetos usando o GitHub.",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 50)).setHours(
        19,
        0,
        0,
        0
      )
    ), // hoje + 50 dias, 19:00
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 50)).setHours(
        20,
        30,
        0,
        0
      )
    ), // dataHoraInicio + 1.5 horas
    local: "Online",
    linkOnline: "https://meet.google.com/example-git-github",
    vagasTotal: 50,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() + 35)).setHours(
        9,
        0,
        0,
        0
      )
    ), // hoje + 35 dias, 09:00
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() + 48)).setHours(
        23,
        59,
        0,
        0
      )
    ), // (hoje + 50) - 2 dias = hoje + 48
    status: "Publicada",
  },
  {
    nome: "Visita Técnica à Empresa X de Tecnologia", // ATIVIDADE 3 (Histórico)
    tipo: "Outro", // Alterado de "Visita Técnica" para "Outro"
    descricao:
      "Conheça o dia a dia de uma empresa de tecnologia e suas áreas de atuação.",
    dataHoraInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 30)).setHours(
        10,
        0,
        0,
        0
      )
    ), // Mês passado
    dataHoraFim: new Date(
      new Date(new Date().setDate(new Date().getDate() - 30)).setHours(
        12,
        0,
        0,
        0
      )
    ), // Mês passado
    local: "Empresa X - Rua Inovação, 123",
    vagasTotal: 20,
    periodoInscricaoInicio: new Date(
      new Date(new Date().setDate(new Date().getDate() - 40)).setHours(
        9,
        0,
        0,
        0
      )
    ),
    periodoInscricaoFim: new Date(
      new Date(new Date().setDate(new Date().getDate() - 35)).setHours(
        23,
        59,
        0,
        0
      )
    ),
    status: "Realizada",
    // inscricoesCount será calculado dinamicamente
  },
];

const seedActivities = async () => {
  try {
    await connectDB();
    console.log("Conectado ao banco de dados para semear atividades.");

    const adminUser = await User.findOne({
      email: "admin@meninasdigitais.com",
    });

    if (!adminUser) {
      console.error(
        "Erro: Usuário admin (admin@meninasdigitais.com) não encontrado. Execute o seed de usuários primeiro."
      );
      await mongoose.disconnect();
      return;
    }

    const adminUserId = adminUser._id;

    await Activity.deleteMany({});
    console.log("Atividades existentes foram removidas.");

    const activitiesToCreate = activities.map((activity) => ({
      ...activity,
      criadoPor: adminUserId,
    }));

    await Activity.insertMany(activitiesToCreate);

    console.log(
      `${activitiesToCreate.length} atividades semeadas com sucesso!`
    );
  } catch (error) {
    console.error("Erro ao semear atividades:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado do banco de dados após semear atividades.");
  }
};

if (require.main === module) {
  seedActivities();
}

module.exports = seedActivities;
