// frontend/src/utils/formatters.js

/**
 * Formata uma data para o formato brasileiro
 * @param {string} dateString - String da data a ser formatada
 * @param {boolean} includeTime - Se deve incluir hora e minuto
 * @returns {string} Data formatada
 */
export const formatDate = (dateString, includeTime = false) => {
  if (!dateString) return "N/A";

  const options = {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...(includeTime && {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };

  return new Date(dateString).toLocaleDateString("pt-BR", options);
};

/**
 * Formata um telefone para o formato brasileiro
 * @param {string} phone - Número de telefone
 * @returns {string} Telefone formatado
 */
export const formatPhone = (phone) => {
  if (!phone) return "";

  // Remove todos os caracteres não numéricos
  const numbers = phone.replace(/\D/g, "");

  // Verifica se é celular (9 dígitos) ou fixo (8 dígitos)
  if (numbers.length === 11) {
    return numbers.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (numbers.length === 10) {
    return numbers.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return phone; // Retorna original se não conseguir formatar
};

/**
 * Formata um valor monetário para o formato brasileiro
 * @param {number} value - Valor a ser formatado
 * @returns {string} Valor formatado
 */
export const formatCurrency = (value) => {
  if (value == null) return "R$ 0,00";

  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);
};
