// backend/src/middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const protect = async (req, res, next) => {
  let token;

  // 1. Verificar se o token existe no header Authorization
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      // 2. Extrair o token do header (formato: "Bearer TOKEN_AQUI")
      token = req.headers.authorization.split(" ")[1];

      // 3. Verificar e decodificar o token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // 4. Buscar o usuário no banco de dados pelo ID do token decodificado
      //    e anexar o usuário ao objeto `req` para uso nas rotas protegidas.
      //    Excluímos o passwordHash do objeto user anexado a req.
      req.user = await User.findById(decoded.id).select("-passwordHash");

      if (!req.user) {
        // Se o usuário associado ao token não for encontrado (ex: usuário deletado)
        return res.status(401).json({
          success: false,
          error: {
            message: "Não autorizado, token falhou (usuário não encontrado).",
          },
        });
      }

      // 5. Verificar se a conta do usuário está ativa (se aplicável)
      if (!req.user.isActive) {
        return res.status(403).json({
          // 403 Forbidden
          success: false,
          error: { message: "Não autorizado, conta desativada." },
        });
      }

      next(); // Passa para o próximo middleware ou para o controller da rota
    } catch (error) {
      console.error("Erro na autenticação do token:", error.message);
      // Tratar diferentes erros de token (expirado, inválido, etc.)
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({
          success: false,
          error: { message: "Não autorizado, token expirado." },
        });
      }
      return res.status(401).json({
        success: false,
        error: { message: "Não autorizado, token inválido." },
      });
    }
  }

  if (!token) {
    res.status(401).json({
      success: false,
      error: { message: "Não autorizado, nenhum token fornecido." },
    });
  }
};

// Middleware para autorização baseada em papéis (RBAC)
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    // 1. Garantir que req.user foi definido pelo middleware 'protect'
    if (!req.user || !req.user.role) {
      // Adicionada verificação de req.user.role
      console.warn(
        'RBAC: req.user ou req.user.role não definido. O middleware "protect" rodou corretamente?'
      );
      return res.status(401).json({
        success: false,
        error: {
          message:
            "Não autorizado. Informações de autenticação ausentes ou incompletas.",
        },
      });
    }

    // 2. Verificar se o papel do usuário está diretamente na lista de papéis permitidos
    if (allowedRoles.includes(req.user.role)) {
      return next(); // Usuário tem um dos papéis explicitamente permitidos
    }

    // 3. Lógica específica para SuperAdmin:
    // Se o usuário é 'superadmin' E o papel 'admin' está na lista de papéis permitidos para a rota,
    // então o superadmin também tem acesso.
    if (req.user.role === "superadmin" && allowedRoles.includes("admin")) {
      return next(); // SuperAdmin herda permissões de Admin
    } // 4. Se nenhuma das condições acima for atendida, o usuário não está autorizado.
    return res.status(403).json({
      success: false,
      error: {
        message: `Acesso negado. Usuário com papel '${
          req.user.role
        }' não tem permissão para acessar este recurso que requer um dos seguintes papéis: [${allowedRoles.join(
          ", "
        )}].`,
      },
    });
  };
};

// Exportar os middlewares
module.exports = { protect, authorize };
