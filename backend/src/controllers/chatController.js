import prisma from '../config/database.js';

const rolesCompativeis = (roleA, roleB) => {
  if (!roleA || !roleB) return false;
  return roleA !== roleB;
};

const validarContato = async (usuarioId, contatoId) => {
  if (!Number.isInteger(contatoId) || contatoId <= 0 || contatoId === usuarioId) {
    return { erro: 'Contato inválido' };
  }

  const [usuarioAtual, contato] = await Promise.all([
    prisma.usuario.findUnique({
      where: { id: usuarioId },
      select: { id: true, role: true }
    }),
    prisma.usuario.findUnique({
      where: { id: contatoId },
      select: { id: true, nome: true, role: true, fotoPerfil: true }
    })
  ]);

  if (!usuarioAtual || !contato) {
    return { erro: 'Usuário não encontrado' };
  }

  if (!rolesCompativeis(usuarioAtual.role, contato.role)) {
    return { erro: 'O chat está disponível apenas entre aluno e professor' };
  }

  return { contato };
};

export const listarConversas = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const roleOposta = req.usuarioRole === 'PROFESSOR' ? 'ALUNO' : 'PROFESSOR';

    const contatos = await prisma.usuario.findMany({
      where: { role: roleOposta },
      select: {
        id: true,
        nome: true,
        role: true,
        fotoPerfil: true
      },
      orderBy: { nome: 'asc' }
    });

    const conversas = await Promise.all(
      contatos.map(async (contato) => {
        const ultimaMensagem = await prisma.mensagem.findFirst({
          where: {
            OR: [
              { remetenteId: usuarioId, destinatarioId: contato.id },
              { remetenteId: contato.id, destinatarioId: usuarioId }
            ]
          },
          orderBy: { criadoEm: 'desc' }
        });

        const naoLidas = await prisma.mensagem.count({
          where: {
            remetenteId: contato.id,
            destinatarioId: usuarioId,
            lida: false
          }
        });

        return {
          ...contato,
          naoLidas,
          ultimaMensagem: ultimaMensagem
            ? {
                id: ultimaMensagem.id,
                conteudo: ultimaMensagem.conteudo,
                remetenteId: ultimaMensagem.remetenteId,
                criadoEm: ultimaMensagem.criadoEm
              }
            : null
        };
      })
    );

    const ordenadas = conversas.sort((a, b) => {
      const dataA = a.ultimaMensagem ? new Date(a.ultimaMensagem.criadoEm).getTime() : 0;
      const dataB = b.ultimaMensagem ? new Date(b.ultimaMensagem.criadoEm).getTime() : 0;
      return dataB - dataA;
    });

    res.json({
      sucesso: true,
      dados: ordenadas
    });
  } catch (error) {
    console.error('Erro ao listar conversas:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar conversas'
    });
  }
};

export const listarMensagens = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const contatoId = parseInt(req.params.contatoId, 10);
    const validacao = await validarContato(usuarioId, contatoId);

    if (validacao.erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: validacao.erro
      });
    }

    const mensagens = await prisma.mensagem.findMany({
      where: {
        OR: [
          { remetenteId: usuarioId, destinatarioId: contatoId },
          { remetenteId: contatoId, destinatarioId: usuarioId }
        ]
      },
      orderBy: { criadoEm: 'asc' }
    });

    await prisma.mensagem.updateMany({
      where: {
        remetenteId: contatoId,
        destinatarioId: usuarioId,
        lida: false
      },
      data: { lida: true }
    });

    res.json({
      sucesso: true,
      dados: mensagens
    });
  } catch (error) {
    console.error('Erro ao listar mensagens:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar mensagens'
    });
  }
};

export const enviarMensagem = async (req, res) => {
  try {
    const usuarioId = req.usuarioId;
    const contatoId = parseInt(req.params.contatoId, 10);
    const conteudo = (req.body?.conteudo || '').trim();

    if (!conteudo) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Mensagem não pode estar vazia'
      });
    }

    if (conteudo.length > 1000) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Mensagem deve ter no máximo 1000 caracteres'
      });
    }

    const validacao = await validarContato(usuarioId, contatoId);
    if (validacao.erro) {
      return res.status(400).json({
        sucesso: false,
        mensagem: validacao.erro
      });
    }

    const mensagem = await prisma.mensagem.create({
      data: {
        conteudo,
        remetenteId: usuarioId,
        destinatarioId: contatoId
      }
    });

    res.status(201).json({
      sucesso: true,
      mensagem: 'Mensagem enviada com sucesso',
      dados: mensagem
    });
  } catch (error) {
    console.error('Erro ao enviar mensagem:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao enviar mensagem'
    });
  }
};
