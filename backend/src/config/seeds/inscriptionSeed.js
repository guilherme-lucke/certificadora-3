const mongoose = require("mongoose");
const dotenv = require("dotenv");
const path = require("path");
const User = require("../../models/User");
const Activity = require("../../models/Activity");
const Inscription = require("../../models/Inscription");
const connectDB = require("../db");

dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Função para obter uma data aleatória dentro de um período de inscrição
function getRandomDateInRange(startDate, endDate) {
  const start = new Date(startDate).getTime();
  const end = new Date(endDate).getTime();
  if (start > end) return new Date(endDate); // Se início for depois do fim, retorna fim
  const randomTime = start + Math.random() * (end - start);
  return new Date(randomTime);
}

const seedInscriptions = async () => {
  try {
    await connectDB();
    console.log("Conectado ao banco de dados para semear inscrições.");

    // 1. Limpar inscrições existentes
    await Inscription.deleteMany({});
    console.log("Inscrições existentes foram removidas.");

    // 2. Buscar todos os estudantes e todas as atividades
    const estudantes = await User.find({ role: "estudante" });
    const atividades = await Activity.find({});

    if (estudantes.length === 0) {
      console.log(
        "Nenhum estudante encontrado. Execute o seed de usuários primeiro."
      );
      return;
    }
    if (atividades.length === 0) {
      console.log(
        "Nenhuma atividade encontrada. Execute o seed de atividades primeiro."
      );
      return;
    }

    console.log(
      `Encontrados ${estudantes.length} estudantes e ${atividades.length} atividades.`
    );

    let inscricoesCriadasCount = 0;
    const hoje = new Date();

    // 3. Criar inscrições
    for (const estudante of estudantes) {
      // Cada estudante se inscreve em um número aleatório de atividades (ex: 3 a 7)
      const numAtividadesParaInscrever = Math.floor(Math.random() * 5) + 3; // Entre 3 e 7
      const atividadesEmbaralhadas = [...atividades].sort(
        () => 0.5 - Math.random()
      );
      let atividadesInscritasParaEsteEstudante = 0;

      for (const atividade of atividadesEmbaralhadas) {
        if (
          atividadesInscritasParaEsteEstudante >= numAtividadesParaInscrever
        ) {
          break; // Já se inscreveu no número alvo de atividades
        }

        // Verificar se já existe inscrição para este estudante nesta atividade
        const inscricaoExistente = await Inscription.findOne({
          studentId: estudante._id,
          activityId: atividade._id,
        });
        if (inscricaoExistente) {
          continue; // Já inscrito, pular para a próxima atividade
        }

        // Verificar se ainda há vagas (pré-verificação, a contagem final será feita depois)
        // Esta verificação é mais para simular um cenário onde o seed não sobrecarrega as vagas
        const inscricoesAtuaisNaAtividade = await Inscription.countDocuments({
          activityId: atividade._id,
        });
        if (inscricoesAtuaisNaAtividade >= atividade.vagasTotal) {
          continue; // Atividade já lotada (simulação)
        }

        let dataInscricao;
        if (atividade.status === "Realizada") {
          // Para atividades realizadas, data de inscrição dentro do período original
          dataInscricao = getRandomDateInRange(
            atividade.periodoInscricaoInicio,
            atividade.periodoInscricaoFim
          );
        } else if (
          new Date(atividade.periodoInscricaoInicio) <= hoje &&
          new Date(atividade.periodoInscricaoFim) >= hoje
        ) {
          // Para atividades com inscrições abertas ou publicadas e dentro do período
          dataInscricao = getRandomDateInRange(
            new Date(atividade.periodoInscricaoInicio) > hoje
              ? new Date(atividade.periodoInscricaoInicio)
              : hoje, // Se inicio for futuro, usa inicio, senão hoje
            atividade.periodoInscricaoFim
          );
        } else if (new Date(atividade.periodoInscricaoFim) < hoje) {
          // Inscrições já encerradas, mas atividade ainda não realizada
          // Inscrever com data dentro do período de inscrição
          dataInscricao = getRandomDateInRange(
            atividade.periodoInscricaoInicio,
            atividade.periodoInscricaoFim
          );
        } else {
          // Inscrições futuras, não inscreve ainda ou inscreve no primeiro dia
          // Para simplificar o seed, vamos pular ou inscrever no primeiro dia se quisermos forçar
          // console.log(`Pulando inscrição para ${estudante.nomeCompleto} em ${atividade.nome} (inscrições futuras)`);
          // continue;
          dataInscricao = new Date(atividade.periodoInscricaoInicio);
        }

        // Garante que a data de inscrição não seja após o fim das inscrições
        if (dataInscricao > new Date(atividade.periodoInscricaoFim)) {
          dataInscricao = new Date(atividade.periodoInscricaoFim);
        }
        // Garante que a data de inscrição não seja antes do início das inscrições
        if (dataInscricao < new Date(atividade.periodoInscricaoInicio)) {
          dataInscricao = new Date(atividade.periodoInscricaoInicio);
        }

        try {
          await Inscription.create({
            studentId: estudante._id,
            activityId: atividade._id,
            status: "Confirmada", // Assumir confirmada para o seed
            dataInscricao: dataInscricao,
          });
          inscricoesCriadasCount++;
          atividadesInscritasParaEsteEstudante++;
        } catch (e) {
          console.warn(
            `Aviso: Não foi possível criar inscrição para ${estudante.nomeCompleto} em ${atividade.nome}. Erro: ${e.message}`
          );
        }
      }
      console.log(
        `Estudante ${estudante.nomeCompleto} (${estudante.email}) inscrito em ${atividadesInscritasParaEsteEstudante} atividades.`
      );
    }
    console.log(
      `--- ${inscricoesCriadasCount} inscrições foram criadas no total. ---`
    );

    // 4. Atualizar inscricoesCount e status das atividades
    console.log(
      "\n--- Atualizando contagem de inscritos e status das atividades ---"
    );
    for (const atividade of atividades) {
      const count = await Inscription.countDocuments({
        activityId: atividade._id,
      });

      let statusOriginal = atividade.status;
      atividade.inscricoesCount = count;

      if (
        count >= atividade.vagasTotal &&
        (atividade.status === "Inscrições Abertas" ||
          (atividade.status === "Publicada" &&
            new Date(atividade.periodoInscricaoInicio) <= hoje &&
            new Date(atividade.periodoInscricaoFim) >= hoje)) &&
        new Date(atividade.periodoInscricaoFim) >= hoje // E o período de inscrição ainda não terminou
      ) {
        atividade.status = "Vagas Esgotadas";
      } else if (
        count < atividade.vagasTotal &&
        atividade.status === "Vagas Esgotadas" && // Se estava esgotada mas agora tem vaga (ex: seed rodou de novo)
        new Date(atividade.periodoInscricaoInicio) <= hoje &&
        new Date(atividade.periodoInscricaoFim) >= hoje &&
        atividade.dataHoraInicio > hoje // E a atividade ainda não começou
      ) {
        // Se o período de inscrição ainda está aberto
        atividade.status = "Inscrições Abertas";
      }

      // Garante que atividades com data de inscrição encerrada tenham o status correto
      if (
        new Date(atividade.periodoInscricaoFim) < hoje &&
        atividade.status !== "Realizada" &&
        atividade.status !== "Cancelada" &&
        atividade.status !== "Vagas Esgotadas"
      ) {
        if (atividade.dataHoraInicio > hoje) {
          // Se a atividade ainda não ocorreu
          atividade.status = "Inscrições Encerradas";
        }
      }

      await atividade.save();
      if (statusOriginal !== atividade.status) {
        console.log(
          `Atividade "${atividade.nome}": ${count} inscritos. Status alterado de "${statusOriginal}" para "${atividade.status}".`
        );
      } else {
        console.log(
          `Atividade "${atividade.nome}": ${count} inscritos. Status permaneceu "${atividade.status}".`
        );
      }
    }
    console.log(
      "--- Contagem de inscritos e status das atividades atualizados. ---"
    );
  } catch (error) {
    console.error("Erro ao semear inscrições:", error);
  } finally {
    await mongoose.disconnect();
    console.log("Desconectado do banco de dados após semear inscrições.");
  }
};

if (require.main === module) {
  seedInscriptions();
}

module.exports = seedInscriptions;
