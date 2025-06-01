export const validateEmail = (email) => {
  if (!email) return "E-mail é obrigatório.";
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return "Formato de e-mail inválido.";
  return "";
};

export const validatePassword = (password) => {
  if (!password) return "Senha é obrigatória.";
  if (password.length < 6) return "Senha deve ter no mínimo 6 caracteres."; 
  return "";
};

export const validateRequired = (value, fieldName) => {
  if (!value || (typeof value === "string" && value.trim() === ""))
    return `${fieldName} é obrigatório(a).`;
  return "";
};