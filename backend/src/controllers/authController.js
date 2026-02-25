import bcrypt from 'bcrypt';
import crypto from 'crypto';
import prisma from '../config/database.js';
import { gerarToken } from '../middlewares/auth.js';
import { enviarEmail } from '../services/emailService.js';

/**
 * Cadastrar novo usuário
 */
export const cadastrar = async (req, res) => {
  try {
    const { nome, email, senha, role } = req.body;

    // Verificar se email já existe
    const usuarioExistente = await prisma.usuario.findUnique({
      where: { email }
    });

    if (usuarioExistente) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Email já cadastrado no sistema'
      });
    }

    // Hash da senha
    const senhaHash = await bcrypt.hash(senha, 10);

    // Criar usuário
    const usuario = await prisma.usuario.create({
      data: {
        nome,
        email,
        senha: senhaHash,
        role: role === 'PROFESSOR' ? 'PROFESSOR' : 'ALUNO'
      },
      select: {
        id: true,
        nome: true,
        email: true,
        role: true,
        criadoEm: true
      }
    });

    // Gerar token
    const token = gerarToken(usuario);

    // Email de boas-vindas (opcional)
    try {
      await enviarEmail({
        para: usuario.email,
        assunto: '🎓 Bem-vindo ao TarefaFácil!',
        html: `
          <h2>Olá ${usuario.nome}!</h2>
          <p>Seja bem-vindo ao <strong>TarefaFácil</strong>!</p>
          <p>Agora você pode organizar suas tarefas escolares de forma simples e eficiente.</p>
          <p>Comece criando sua primeira tarefa e aproveite todos os recursos disponíveis!</p>
          <br>
          <p>Bons estudos! 📚✨</p>
        `
      });
    } catch (emailError) {
      console.error('Erro ao enviar email de boas-vindas:', emailError);
    }

    res.status(201).json({
      sucesso: true,
      mensagem: 'Usuário cadastrado com sucesso',
      dados: {
        usuario,
        token
      }
    });
  } catch (error) {
    console.error('Erro ao cadastrar usuário:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao cadastrar usuário'
    });
  }
};

/**
 * Fazer login
 */
export const login = async (req, res) => {
  try {
    const { email, senha } = req.body;

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Email ou senha incorretos'
      });
    }

    // Verificar senha
    const senhaValida = await bcrypt.compare(senha, usuario.senha);

    if (!senhaValida) {
      return res.status(401).json({
        sucesso: false,
        mensagem: 'Email ou senha incorretos'
      });
    }

    // Gerar token
    const token = gerarToken(usuario);

    res.json({
      sucesso: true,
      mensagem: 'Login realizado com sucesso',
      dados: {
        usuario: {
          id: usuario.id,
          nome: usuario.nome,
          email: usuario.email,
          role: usuario.role
        },
        token
      }
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao fazer login'
    });
  }
};

/**
 * Solicitar recuperação de senha
 */
export const solicitarRecuperacaoSenha = async (req, res) => {
  try {
    const { email } = req.body;

    const usuario = await prisma.usuario.findUnique({
      where: { email }
    });

    if (!usuario) {
      // Por segurança, não informar se o email existe ou não
      return res.json({
        sucesso: true,
        mensagem: 'Se o email estiver cadastrado, você receberá instruções de recuperação'
      });
    }

    // Gerar token de recuperação
    const token = crypto.randomBytes(32).toString('hex');
    const expiracao = new Date(Date.now() + 3600000); // 1 hora

    // Salvar token no banco
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        resetToken: token,
        resetTokenExpiry: expiracao
      }
    });

    // Enviar email
    const linkRecuperacao = `${process.env.FRONTEND_URL}/redefinir-senha?token=${token}`;
    
    await enviarEmail({
      para: usuario.email,
      assunto: '🔑 Recuperação de Senha - TarefaFácil',
      html: `
        <h2>Olá ${usuario.nome}!</h2>
        <p>Você solicitou a recuperação de senha.</p>
        <p>Clique no link abaixo para redefinir sua senha:</p>
        <a href="${linkRecuperacao}" style="display: inline-block; padding: 12px 24px; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 6px; margin: 16px 0;">
          Redefinir Senha
        </a>
        <p>Este link expira em 1 hora.</p>
        <p>Se você não solicitou esta recuperação, ignore este email.</p>
      `
    });

    res.json({
      sucesso: true,
      mensagem: 'Se o email estiver cadastrado, você receberá instruções de recuperação'
    });
  } catch (error) {
    console.error('Erro ao solicitar recuperação de senha:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao processar solicitação'
    });
  }
};

/**
 * Redefinir senha com token
 */
export const redefinirSenha = async (req, res) => {
  try {
    const { token, novaSenha } = req.body;

    // Buscar usuário com o token válido
    const usuario = await prisma.usuario.findFirst({
      where: {
        resetToken: token,
        resetTokenExpiry: {
          gte: new Date()
        }
      }
    });

    if (!usuario) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Token inválido ou expirado'
      });
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha e limpar token
    await prisma.usuario.update({
      where: { id: usuario.id },
      data: {
        senha: senhaHash,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({
      sucesso: true,
      mensagem: 'Senha redefinida com sucesso'
    });
  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao redefinir senha'
    });
  }
};

/**
 * Logout (apenas retorna sucesso, invalidação real é feita no frontend)
 */
export const logout = async (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'Logout realizado com sucesso'
  });
};
