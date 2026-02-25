import jwt from 'jsonwebtoken';

/**
 * Middleware para verificar autenticação JWT
 */
export const verificarAuth = async (req, res, next) => {
  try {
    // Obter token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token de autenticação não fornecido'
      });
    }

    const token = authHeader.substring(7); // Remove "Bearer "

    // Verificar e decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Adicionar informações do usuário à requisição
    req.usuarioId = decoded.id;
    req.usuarioEmail = decoded.email;
    req.usuarioRole = decoded.role;
    
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token expirado. Faça login novamente.'
      });
    }
    
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Token inválido'
      });
    }
    
    return res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao verificar autenticação'
    });
  }
};

/**
 * Gerar token JWT
 */
export const gerarToken = (usuario) => {
  return jwt.sign(
    {
      id: usuario.id,
      email: usuario.email,
      nome: usuario.nome,
      role: usuario.role || 'ALUNO'
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || '7d'
    }
  );
};

/**
 * Middleware para verificar role/permissões
 */
export const verificarRole = (requiredRole) => {
  return (req, res, next) => {
    const role = req.usuarioRole;
    if (!role) {
      return res.status(403).json({ sucesso: false, mensagem: 'Role não encontrado no token' });
    }
    if (role !== requiredRole) {
      return res.status(403).json({ sucesso: false, mensagem: 'Permissão negada' });
    }
    next();
  };
};
