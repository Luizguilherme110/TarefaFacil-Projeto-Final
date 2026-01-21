import bcrypt from 'bcrypt';
import prisma from '../config/database.js';

/**
 * Obter perfil do usuário logado
 */
export const obterPerfil = async (req, res) => {
  try {
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId },
      select: {
        id: true,
        nome: true,
        email: true,
        notificacoesAtivas: true,
        horarioNotificacao: true,
        criadoEm: true,
        _count: {
          select: {
            tarefas: true
          }
        }
      }
    });

    if (!usuario) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Usuário não encontrado'
      });
    }

    res.json({
      sucesso: true,
      dados: usuario
    });
  } catch (error) {
    console.error('Erro ao obter perfil:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter perfil'
    });
  }
};

/**
 * Atualizar perfil do usuário
 */
export const atualizarPerfil = async (req, res) => {
  try {
    const { nome, email } = req.body;
    const dadosAtualizacao = {};

    if (nome) dadosAtualizacao.nome = nome;
    
    if (email) {
      // Verificar se o novo email já está em uso por outro usuário
      const emailExistente = await prisma.usuario.findFirst({
        where: {
          email,
          NOT: {
            id: req.usuarioId
          }
        }
      });

      if (emailExistente) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Email já está em uso'
        });
      }

      dadosAtualizacao.email = email;
    }

    const usuario = await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: dadosAtualizacao,
      select: {
        id: true,
        nome: true,
        email: true,
        criadoEm: true
      }
    });

    res.json({
      sucesso: true,
      mensagem: 'Perfil atualizado com sucesso',
      dados: usuario
    });
  } catch (error) {
    console.error('Erro ao atualizar perfil:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar perfil'
    });
  }
};

/**
 * Alterar senha do usuário
 */
export const alterarSenha = async (req, res) => {
  try {
    const { senhaAtual, novaSenha } = req.body;

    // Buscar usuário
    const usuario = await prisma.usuario.findUnique({
      where: { id: req.usuarioId }
    });

    // Verificar senha atual
    const senhaValida = await bcrypt.compare(senhaAtual, usuario.senha);

    if (!senhaValida) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Senha atual incorreta'
      });
    }

    // Hash da nova senha
    const senhaHash = await bcrypt.hash(novaSenha, 10);

    // Atualizar senha
    await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: { senha: senhaHash }
    });

    res.json({
      sucesso: true,
      mensagem: 'Senha alterada com sucesso'
    });
  } catch (error) {
    console.error('Erro ao alterar senha:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao alterar senha'
    });
  }
};

/**
 * Atualizar preferências de notificações
 */
export const atualizarPreferencias = async (req, res) => {
  try {
    const { notificacoesAtivas, horarioNotificacao } = req.body;
    const dadosAtualizacao = {};

    if (typeof notificacoesAtivas === 'boolean') {
      dadosAtualizacao.notificacoesAtivas = notificacoesAtivas;
    }

    if (horarioNotificacao && horarioNotificacao >= 0 && horarioNotificacao <= 23) {
      dadosAtualizacao.horarioNotificacao = horarioNotificacao;
    }

    const usuario = await prisma.usuario.update({
      where: { id: req.usuarioId },
      data: dadosAtualizacao,
      select: {
        id: true,
        notificacoesAtivas: true,
        horarioNotificacao: true
      }
    });

    res.json({
      sucesso: true,
      mensagem: 'Preferências atualizadas com sucesso',
      dados: usuario
    });
  } catch (error) {
    console.error('Erro ao atualizar preferências:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar preferências'
    });
  }
};

/**
 * Excluir conta do usuário
 */
export const excluirConta = async (req, res) => {
  try {
    await prisma.usuario.delete({
      where: { id: req.usuarioId }
    });

    res.json({
      sucesso: true,
      mensagem: 'Conta excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir conta:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao excluir conta'
    });
  }
};
