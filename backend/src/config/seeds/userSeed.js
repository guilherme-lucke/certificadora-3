const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const User = require("../../models/User"); // Ajuste o caminho conforme necessário
const connectDB = require("../db"); // Ajuste o caminho conforme necessário

dotenv.config({ path: require("path").resolve(__dirname, "../../../.env") }); // Carrega as variáveis de ambiente

const users = [
  {
    email: "superadmin@meninasdigitais.com",
    passwordHash: "SuperAdmin123!", // Alterado de password para passwordHash
    role: "superadmin", // Alterado para minúsculas
    nomeCompleto: "Super Admin", // Alterado de name para nomeCompleto
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  {
    email: "admin@meninasdigitais.com",
    passwordHash: "Admin123!", // Alterado de password para passwordHash
    role: "admin", // Alterado para minúsculas
    nomeCompleto: "Admin", // Alterado de name para nomeCompleto
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  {
    email: "estudante@email.com",
    passwordHash: "Estudante123!",
    role: "estudante",
    nomeCompleto: "Estudante Teste",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41999998888",
    dataNascimento: new Date("2005-08-15"), // Exemplo de data
    escola: "Escola Modelo",
    serieAno: "3º Ano Ensino Médio",
    interesses: ["Programação", "Games", "Ciência"],
  },
  // Novos Admins
  {
    email: "melissa.admin@meninasdigitais.com",
    passwordHash: "AdminMelissa123!",
    role: "admin",
    nomeCompleto: "Melissa Admin",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  {
    email: "camila.admin@meninasdigitais.com",
    passwordHash: "AdminCamila123!",
    role: "admin",
    nomeCompleto: "Camila Admin",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  // Mais Admins para paginação
  {
    email: "fernanda.admin@meninasdigitais.com",
    passwordHash: "AdminFernanda123!",
    role: "admin",
    nomeCompleto: "Fernanda Admin",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  {
    email: "gabriela.admin@meninasdigitais.com",
    passwordHash: "AdminGabriela123!",
    role: "admin",
    nomeCompleto: "Gabriela Admin",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  {
    email: "isabela.admin@meninasdigitais.com",
    passwordHash: "AdminIsabela123!",
    role: "admin",
    nomeCompleto: "Isabela Admin",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  {
    email: "juliana.admin@meninasdigitais.com",
    passwordHash: "AdminJuliana123!",
    role: "admin",
    nomeCompleto: "Juliana Admin",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  {
    email: "leticia.admin@meninasdigitais.com",
    passwordHash: "AdminLeticia123!",
    role: "admin",
    nomeCompleto: "Leticia Admin",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  {
    email: "manuela.admin@meninasdigitais.com",
    passwordHash: "AdminManuela123!",
    role: "admin",
    nomeCompleto: "Manuela Admin",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  {
    email: "natalia.admin@meninasdigitais.com",
    passwordHash: "AdminNatalia123!",
    role: "admin",
    nomeCompleto: "Natalia Admin",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  {
    email: "olivia.admin@meninasdigitais.com",
    passwordHash: "AdminOlivia123!",
    role: "admin",
    nomeCompleto: "Olivia Admin",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
  },
  // Novos Estudantes
  {
    email: "joana.estudante@email.com",
    passwordHash: "EstudanteJoana123!",
    role: "estudante",
    nomeCompleto: "Joana Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41988887777",
    dataNascimento: new Date("2006-01-20"),
    escola: "Colégio Estadual Tiradentes",
    serieAno: "2º Ano Ensino Médio",
    interesses: ["Robótica", "Desenvolvimento Web"],
  },
  {
    email: "beatriz.estudante@email.com",
    passwordHash: "EstudanteBeatriz123!",
    role: "estudante",
    nomeCompleto: "Beatriz Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41977776666",
    dataNascimento: new Date("2007-05-10"),
    escola: "Escola Municipal Vinicius de Moraes",
    serieAno: "1º Ano Ensino Médio",
    interesses: ["Inteligência Artificial", "Matemática"],
  },
  {
    email: "ana.estudante@email.com",
    passwordHash: "EstudanteAna123!",
    role: "estudante",
    nomeCompleto: "Ana Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41966665555",
    dataNascimento: new Date("2005-11-03"),
    escola: "Instituto Federal do Paraná",
    serieAno: "3º Ano Ensino Médio",
    interesses: ["Design Gráfico", "UX/UI"],
  },
  {
    email: "laura.estudante@email.com",
    passwordHash: "EstudanteLaura123!",
    role: "estudante",
    nomeCompleto: "Laura Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41955554444",
    dataNascimento: new Date("2008-02-25"),
    escola: "Colégio Positivo",
    serieAno: "9º Ano Ensino Fundamental",
    interesses: ["Segurança da Informação", "Redes"],
  },
  // Mais Estudantes para paginação
  {
    email: "carolina.estudante@email.com",
    passwordHash: "EstudanteCarolina123!",
    role: "estudante",
    nomeCompleto: "Carolina Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41944443333",
    dataNascimento: new Date("2006-07-11"),
    escola: "Escola Nova",
    serieAno: "2º Ano EM",
    interesses: ["Música", "Arte Digital"],
  },
  {
    email: "daniela.estudante@email.com",
    passwordHash: "EstudanteDaniela123!",
    role: "estudante",
    nomeCompleto: "Daniela Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41933332222",
    dataNascimento: new Date("2007-03-05"),
    escola: "Colégio Saber",
    serieAno: "1º Ano EM",
    interesses: ["Ciência de Dados", "Biologia"],
  },
  {
    email: "eduarda.estudante@email.com",
    passwordHash: "EstudanteEduarda123!",
    role: "estudante",
    nomeCompleto: "Eduarda Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41922221111",
    dataNascimento: new Date("2005-09-18"),
    escola: "Escola Aprender",
    serieAno: "3º Ano EM",
    interesses: ["História", "Literatura"],
  },
  {
    email: "fernanda.estudante@email.com",
    passwordHash: "EstudanteFernanda123!",
    role: "estudante",
    nomeCompleto: "Fernanda Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41911110000",
    dataNascimento: new Date("2008-01-02"),
    escola: "Colégio Crescer",
    serieAno: "9º Ano EF",
    interesses: ["Esportes", "Fotografia"],
  },
  {
    email: "gabriela.estudante@email.com",
    passwordHash: "EstudanteGabriela123!",
    role: "estudante",
    nomeCompleto: "Gabriela Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41900009999",
    dataNascimento: new Date("2006-12-20"),
    escola: "Escola Futuro",
    serieAno: "2º Ano EM",
    interesses: ["Teatro", "Dança"],
  },
  {
    email: "helena.estudante@email.com",
    passwordHash: "EstudanteHelena123!",
    role: "estudante",
    nomeCompleto: "Helena Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41999888777",
    dataNascimento: new Date("2007-08-30"),
    escola: "Colégio Inovação",
    serieAno: "1º Ano EM",
    interesses: ["Astronomia", "Física"],
  },
  // Adicionando mais 10 estudantes
  {
    email: "isadora.estudante@email.com",
    passwordHash: "EstudanteIsadora123!",
    role: "estudante",
    nomeCompleto: "Isadora Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41987654321",
    dataNascimento: new Date("2006-05-12"),
    escola: "Escola Criativa",
    serieAno: "2º Ano EM",
    interesses: ["Desenho", "Animação"],
  },
  {
    email: "julia.estudante@email.com",
    passwordHash: "EstudanteJulia123!",
    role: "estudante",
    nomeCompleto: "Julia Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41912345678",
    dataNascimento: new Date("2008-11-08"),
    escola: "Colégio Alpha",
    serieAno: "9º Ano EF",
    interesses: ["Química", "Ciências Ambientais"],
  },
  {
    email: "lara.estudante@email.com",
    passwordHash: "EstudanteLara123!",
    role: "estudante",
    nomeCompleto: "Lara Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41923456789",
    dataNascimento: new Date("2005-02-15"),
    escola: "Escola Beta",
    serieAno: "3º Ano EM",
    interesses: ["Engenharia", "Robótica"],
  },
  {
    email: "luiza.estudante@email.com",
    passwordHash: "EstudanteLuiza123!",
    role: "estudante",
    nomeCompleto: "Luiza Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41934567890",
    dataNascimento: new Date("2007-09-22"),
    escola: "Colégio Gama",
    serieAno: "1º Ano EM",
    interesses: ["Medicina", "Biologia Celular"],
  },
  {
    email: "mariana.estudante@email.com",
    passwordHash: "EstudanteMariana123!",
    role: "estudante",
    nomeCompleto: "Mariana Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41945678901",
    dataNascimento: new Date("2006-03-30"),
    escola: "Escola Delta",
    serieAno: "2º Ano EM",
    interesses: ["Jornalismo", "Escrita Criativa"],
  },
  {
    email: "nina.estudante@email.com",
    passwordHash: "EstudanteNina123!",
    role: "estudante",
    nomeCompleto: "Nina Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41956789012",
    dataNascimento: new Date("2008-07-14"),
    escola: "Colégio Epsilon",
    serieAno: "9º Ano EF",
    interesses: ["Psicologia", "Sociologia"],
  },
  {
    email: "olivia.s.estudante@email.com", // Adicionado .s para diferenciar do admin
    passwordHash: "EstudanteOliviaS123!",
    role: "estudante",
    nomeCompleto: "Olivia Silva Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41967890123",
    dataNascimento: new Date("2005-10-01"),
    escola: "Escola Zeta",
    serieAno: "3º Ano EM",
    interesses: ["Direito", "Filosofia"],
  },
  {
    email: "penelope.estudante@email.com",
    passwordHash: "EstudantePenelope123!",
    role: "estudante",
    nomeCompleto: "Penelope Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41978901234",
    dataNascimento: new Date("2007-01-19"),
    escola: "Colégio Eta",
    serieAno: "1º Ano EM",
    interesses: ["Arquitetura", "Urbanismo"],
  },
  {
    email: "rafaela.estudante@email.com",
    passwordHash: "EstudanteRafaela123!",
    role: "estudante",
    nomeCompleto: "Rafaela Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41989012345",
    dataNascimento: new Date("2006-08-05"),
    escola: "Escola Teta",
    serieAno: "2º Ano EM",
    interesses: ["Moda", "Design de Interiores"],
  },
  {
    email: "sofia.estudante@email.com",
    passwordHash: "EstudanteSofia123!",
    role: "estudante",
    nomeCompleto: "Sofia Estudante",
    isVerified: true,
    aceitouPoliticaPrivacidade: true,
    telefone: "41990123456",
    dataNascimento: new Date("2008-04-28"),
    escola: "Colégio Iota",
    serieAno: "9º Ano EF",
    interesses: ["Gastronomia", "Nutrição"],
  },
];

const seedUsers = async () => {
  try {
    await connectDB(); // Conecta ao banco de dados

    // Limpar usuários existentes com os mesmos emails para evitar duplicatas
    for (const userData of users) {
      await User.deleteOne({ email: userData.email });
    }
    console.log("Usuários existentes com os mesmos emails foram removidos.");

    // O hash da senha será feito pelo hook pre-save do UserSchema.
    // Iterar e salvar cada usuário individualmente para garantir que o hook 'save' seja disparado.
    for (const userData of users) {
      const user = new User(userData);
      await user.save(); // Isso irá disparar o hook pre('save')
    }
    console.log("Usuários semeados com sucesso!");
  } catch (error) {
    console.error("Erro ao semear usuários:", error);
  } finally {
    await mongoose.disconnect(); // Desconecta do banco de dados
    console.log("Desconectado do banco de dados.");
  }
};

// Executa a função de semeadura se o script for chamado diretamente
if (require.main === module) {
  seedUsers();
}

module.exports = seedUsers;
