import prisma from '../config/database.js';
import { calcularDiasRestantes, formatarData } from '../utils/helpers.js';

/**
 * Listar todas as tarefas do usuário com filtros
 */
export const listarTarefas = async (req, res) => {
  try {
    const {
      status,
      disciplina,
      prioridade,
      dataInicio,
      dataFim,
      ordenarPor = 'dataEntrega',
      ordem = 'asc'
    } = req.query;

    // Construir filtros
    // Professor vê as tarefas que criou; Aluno vê as designadas para ele
    const where = req.usuarioRole === 'PROFESSOR'
      ? { criadoPorId: req.usuarioId }
      : { usuarioId: req.usuarioId };

    if (status) where.status = status.toUpperCase();
    if (disciplina) where.disciplina = disciplina;
    if (prioridade) where.prioridade = prioridade.toUpperCase();
    
    if (dataInicio || dataFim) {
      where.dataEntrega = {};
      if (dataInicio) where.dataEntrega.gte = new Date(dataInicio);
      if (dataFim) where.dataEntrega.lte = new Date(dataFim);
    }

    // Construir ordenação
    const orderBy = {};
    if (ordenarPor === 'dataEntrega') {
      orderBy.dataEntrega = ordem;
    } else if (ordenarPor === 'prioridade') {
      orderBy.prioridade = ordem;
    } else if (ordenarPor === 'disciplina') {
      orderBy.disciplina = ordem;
    } else {
      orderBy.criadoEm = 'desc';
    }

    const tarefas = await prisma.tarefa.findMany({
      where,
      orderBy,
      include: {
        usuario: {
          select: {
            id: true,
            nome: true
          }
        },
        criadoPor: {
          select: {
            id: true,
            nome: true
          }
        }
      }
    });

    // Adicionar informações extras às tarefas
    const tarefasComExtras = tarefas.map(tarefa => ({
      ...tarefa,
      nomeAluno: tarefa.usuario?.nome,
      nomeProfessor: tarefa.criadoPor?.nome,
      diasRestantes: calcularDiasRestantes(tarefa.dataEntrega),
      atrasada: tarefa.status === 'PENDENTE' && new Date(tarefa.dataEntrega) < new Date(),
      venceHoje: formatarData(tarefa.dataEntrega) === formatarData(new Date())
    }));

    res.json({
      sucesso: true,
      dados: tarefasComExtras,
      total: tarefas.length
    });
  } catch (error) {
    console.error('Erro ao listar tarefas:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao listar tarefas'
    });
  }
};

/**
 * Obter uma tarefa específica
 */
export const obterTarefa = async (req, res) => {
  try {
    const { id } = req.params;

    const tarefa = await prisma.tarefa.findFirst({
      where: {
        id: parseInt(id),
        usuarioId: req.usuarioId
      }
    });

    if (!tarefa) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Tarefa não encontrada'
      });
    }

    // Adicionar informações extras
    const tarefaComExtras = {
      ...tarefa,
      diasRestantes: calcularDiasRestantes(tarefa.dataEntrega),
      atrasada: tarefa.status === 'PENDENTE' && new Date(tarefa.dataEntrega) < new Date(),
      venceHoje: formatarData(tarefa.dataEntrega) === formatarData(new Date())
    };

    res.json({
      sucesso: true,
      dados: tarefaComExtras
    });
  } catch (error) {
    console.error('Erro ao obter tarefa:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter tarefa'
    });
  }
};

/**
 * Criar nova tarefa (professor designa para aluno)
 */
export const criarTarefa = async (req, res) => {
  try {
    const { titulo, descricao, disciplina, prioridade, dataEntrega, alunoId, valorPontos } = req.body;

    // Se alunoId fornecido, tarefa é para o aluno; senão, para o próprio usuário
    const destinatarioId = alunoId ? parseInt(alunoId) : req.usuarioId;

    // Verificar se o aluno existe
    if (alunoId) {
      const aluno = await prisma.usuario.findUnique({ where: { id: destinatarioId } });
      if (!aluno || aluno.role !== 'ALUNO') {
        return res.status(400).json({ sucesso: false, mensagem: 'Aluno não encontrado' });
      }
    }

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo,
        descricao,
        disciplina,
        prioridade: prioridade.toUpperCase(),
        dataEntrega: new Date(dataEntrega),
        valorPontos: valorPontos ? parseFloat(valorPontos) : null,
        usuarioId: destinatarioId,
        criadoPorId: req.usuarioId
      },
      include: {
        usuario: { select: { id: true, nome: true, email: true } }
      }
    });

    // Criar notificações automáticas
    const dataEntregaDate = new Date(dataEntrega);
    const umDiaAntes = new Date(dataEntregaDate);
    umDiaAntes.setDate(umDiaAntes.getDate() - 1);

    // Notificação 1 dia antes
    if (umDiaAntes >= new Date()) {
      await prisma.notificacao.create({
        data: {
          tipo: 'DIA_ANTES',
          tarefaId: tarefa.id
        }
      });
    }

    // Notificação no dia
    await prisma.notificacao.create({
      data: {
        tipo: 'DIA_ENTREGA',
        tarefaId: tarefa.id
      }
    });

    // Notificação imediata: tarefa designada
    await prisma.notificacao.create({
      data: {
        tipo: 'TAREFA_DESIGNADA',
        tarefaId: tarefa.id
      }
    });

    // Enviar email de notificação ao aluno
    if (alunoId && tarefa.usuario?.email) {
      try {
        const { enviarEmail } = await import('../services/emailService.js');
        await enviarEmail({
          para: tarefa.usuario.email,
          assunto: `📋 Nova tarefa designada: ${titulo}`,
          html: `
            <h2>Olá ${tarefa.usuario.nome}!</h2>
            <p>Uma nova tarefa foi designada para você:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0;">${titulo}</h3>
              <p style="margin: 4px 0;"><strong>Disciplina:</strong> ${disciplina}</p>
              <p style="margin: 4px 0;"><strong>Prioridade:</strong> ${prioridade}</p>
              <p style="margin: 4px 0;"><strong>Entrega:</strong> ${new Date(dataEntrega).toLocaleDateString('pt-BR')}</p>
              ${descricao ? `<p style="margin: 4px 0;"><strong>Descrição:</strong> ${descricao}</p>` : ''}
            </div>
            <p>Acesse o TarefaFácil para ver mais detalhes.</p>
          `
        });
      } catch (emailError) {
        console.error('Erro ao enviar email de notificação:', emailError);
      }
    }

    res.status(201).json({
      sucesso: true,
      mensagem: 'Tarefa criada com sucesso',
      dados: tarefa
    });
  } catch (error) {
    console.error('Erro ao criar tarefa:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao criar tarefa'
    });
  }
};

/**
 * Atualizar tarefa
 */
export const atualizarTarefa = async (req, res) => {
  try {
    const { id } = req.params;
    const { titulo, descricao, disciplina, prioridade, dataEntrega } = req.body;

    // Verificar se a tarefa existe e pertence ao usuário
    const tarefaExistente = await prisma.tarefa.findFirst({
      where: {
        id: parseInt(id),
        usuarioId: req.usuarioId
      }
    });

    if (!tarefaExistente) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Tarefa não encontrada'
      });
    }

    const dadosAtualizacao = {};
    if (titulo) dadosAtualizacao.titulo = titulo;
    if (descricao !== undefined) dadosAtualizacao.descricao = descricao;
    if (disciplina) dadosAtualizacao.disciplina = disciplina;
    if (prioridade) dadosAtualizacao.prioridade = prioridade.toUpperCase();
    if (dataEntrega) dadosAtualizacao.dataEntrega = new Date(dataEntrega);

    const tarefa = await prisma.tarefa.update({
      where: { id: parseInt(id) },
      data: dadosAtualizacao
    });

    res.json({
      sucesso: true,
      mensagem: 'Tarefa atualizada com sucesso',
      dados: tarefa
    });
  } catch (error) {
    console.error('Erro ao atualizar tarefa:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao atualizar tarefa'
    });
  }
};

/**
 * Excluir tarefa
 */
export const excluirTarefa = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a tarefa existe e pertence ao usuário
    const tarefaExistente = await prisma.tarefa.findFirst({
      where: {
        id: parseInt(id),
        usuarioId: req.usuarioId
      }
    });

    if (!tarefaExistente) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Tarefa não encontrada'
      });
    }

    await prisma.tarefa.delete({
      where: { id: parseInt(id) }
    });

    res.json({
      sucesso: true,
      mensagem: 'Tarefa excluída com sucesso'
    });
  } catch (error) {
    console.error('Erro ao excluir tarefa:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao excluir tarefa'
    });
  }
};

/**
 * Marcar tarefa como concluída
 */
export const concluirTarefa = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se a tarefa existe e pertence ao usuário
    const tarefaExistente = await prisma.tarefa.findFirst({
      where: {
        id: parseInt(id),
        usuarioId: req.usuarioId
      }
    });

    if (!tarefaExistente) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Tarefa não encontrada'
      });
    }

    const tarefa = await prisma.tarefa.update({
      where: { id: parseInt(id) },
      data: {
        status: 'CONCLUIDA',
        dataConclusao: new Date()
      }
    });

    res.json({
      sucesso: true,
      mensagem: 'Tarefa marcada como concluída',
      dados: tarefa
    });
  } catch (error) {
    console.error('Erro ao concluir tarefa:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao concluir tarefa'
    });
  }
};

/**
 * Reabrir tarefa (marcar como pendente)
 */
export const reabrirTarefa = async (req, res) => {
  try {
    const { id } = req.params;

    // Permitir reabrir se é o aluno (dono) ou professor (criador)
    const tarefaExistente = await prisma.tarefa.findFirst({
      where: {
        id: parseInt(id),
        OR: [
          { usuarioId: req.usuarioId },
          { criadoPorId: req.usuarioId }
        ]
      }
    });

    if (!tarefaExistente) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Tarefa não encontrada'
      });
    }

    const tarefa = await prisma.tarefa.update({
      where: { id: parseInt(id) },
      data: {
        status: 'PENDENTE',
        dataConclusao: null,
        nota: null,
        feedbackProfessor: null
      }
    });

    res.json({
      sucesso: true,
      mensagem: 'Tarefa reaberta',
      dados: tarefa
    });
  } catch (error) {
    console.error('Erro ao reabrir tarefa:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao reabrir tarefa'
    });
  }
};

/**
 * Avaliar tarefa (professor dá nota)
 */
export const avaliarTarefa = async (req, res) => {
  try {
    const { id } = req.params;
    const { nota, feedback } = req.body;

    if (nota === undefined || nota === null || nota < 0 || nota > 10) {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Nota deve ser entre 0 e 10'
      });
    }

    // Verificar se a tarefa existe e foi criada por este professor
    const tarefaExistente = await prisma.tarefa.findFirst({
      where: {
        id: parseInt(id),
        criadoPorId: req.usuarioId
      },
      include: {
        usuario: { select: { id: true, nome: true, email: true } }
      }
    });

    if (!tarefaExistente) {
      return res.status(404).json({
        sucesso: false,
        mensagem: 'Tarefa não encontrada'
      });
    }

    if (tarefaExistente.status !== 'CONCLUIDA') {
      return res.status(400).json({
        sucesso: false,
        mensagem: 'Só é possível avaliar tarefas concluídas pelo aluno'
      });
    }

    const tarefa = await prisma.tarefa.update({
      where: { id: parseInt(id) },
      data: {
        nota: parseFloat(nota),
        feedbackProfessor: feedback || null,
        status: 'AVALIADA'
      }
    });

    // Notificar aluno por email
    if (tarefaExistente.usuario?.email) {
      try {
        const { enviarEmail } = await import('../services/emailService.js');
        await enviarEmail({
          para: tarefaExistente.usuario.email,
          assunto: `\u2705 Tarefa avaliada: ${tarefaExistente.titulo}`,
          html: `
            <h2>Olá ${tarefaExistente.usuario.nome}!</h2>
            <p>Sua tarefa foi avaliada pelo professor:</p>
            <div style="background: #f3f4f6; padding: 16px; border-radius: 8px; margin: 16px 0;">
              <h3 style="margin: 0 0 8px 0;">${tarefaExistente.titulo}</h3>
              <p style="margin: 4px 0; font-size: 24px;"><strong>Nota: ${nota}/10</strong></p>
              ${feedback ? `<p style="margin: 8px 0;"><strong>Feedback:</strong> ${feedback}</p>` : ''}
            </div>
            <p>Acesse o TarefaFácil para ver seus resultados.</p>
          `
        });
      } catch (emailError) {
        console.error('Erro ao enviar email de avaliação:', emailError);
      }
    }

    res.json({
      sucesso: true,
      mensagem: 'Tarefa avaliada com sucesso',
      dados: tarefa
    });
  } catch (error) {
    console.error('Erro ao avaliar tarefa:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao avaliar tarefa'
    });
  }
};

/**
 * Obter dados para o dashboard
 */
export const obterDashboard = async (req, res) => {
  try {
    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    const fimDaSemana = new Date(hoje);
    fimDaSemana.setDate(fimDaSemana.getDate() + 7);

    // Total de tarefas pendentes
    const tarefasPendentes = await prisma.tarefa.count({
      where: {
        usuarioId: req.usuarioId,
        status: 'PENDENTE'
      }
    });

    // Total de tarefas concluídas
    const tarefasConcluidas = await prisma.tarefa.count({
      where: {
        usuarioId: req.usuarioId,
        status: 'CONCLUIDA'
      }
    });

    // Tarefas atrasadas
    const tarefasAtrasadas = await prisma.tarefa.count({
      where: {
        usuarioId: req.usuarioId,
        status: 'PENDENTE',
        dataEntrega: {
          lt: hoje
        }
      }
    });

    // Tarefas para hoje
    const tarefasHoje = await prisma.tarefa.count({
      where: {
        usuarioId: req.usuarioId,
        status: 'PENDENTE',
        dataEntrega: {
          gte: hoje,
          lt: amanha
        }
      }
    });

    // Tarefas da semana
    const tarefasSemana = await prisma.tarefa.count({
      where: {
        usuarioId: req.usuarioId,
        status: 'PENDENTE',
        dataEntrega: {
          gte: hoje,
          lte: fimDaSemana
        }
      }
    });

    // Distribuição por disciplina
    const porDisciplina = await prisma.tarefa.groupBy({
      by: ['disciplina'],
      where: {
        usuarioId: req.usuarioId,
        status: 'PENDENTE'
      },
      _count: {
        id: true
      }
    });

    // Distribuição por prioridade
    const porPrioridade = await prisma.tarefa.groupBy({
      by: ['prioridade'],
      where: {
        usuarioId: req.usuarioId,
        status: 'PENDENTE'
      },
      _count: {
        id: true
      }
    });

    // Tarefas recentes (últimas 5)
    const tarefasRecentes = await prisma.tarefa.findMany({
      where: {
        usuarioId: req.usuarioId
      },
      orderBy: {
        criadoEm: 'desc'
      },
      take: 5
    });

    res.json({
      sucesso: true,
      dados: {
        resumo: {
          tarefasPendentes,
          tarefasConcluidas,
          tarefasAtrasadas,
          tarefasHoje,
          tarefasSemana,
          total: tarefasPendentes + tarefasConcluidas
        },
        distribuicao: {
          porDisciplina,
          porPrioridade
        },
        tarefasRecentes: tarefasRecentes.map(tarefa => ({
          ...tarefa,
          diasRestantes: calcularDiasRestantes(tarefa.dataEntrega),
          atrasada: tarefa.status === 'PENDENTE' && new Date(tarefa.dataEntrega) < hoje
        }))
      }
    });
  } catch (error) {
    console.error('Erro ao obter dados do dashboard:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter dados do dashboard'
    });
  }
};

/**
 * Obter tarefas para o calendário
 */
export const obterCalendario = async (req, res) => {
  try {
    const { mes, ano } = req.query;
    
    const dataInicio = new Date(ano, mes - 1, 1);
    const dataFim = new Date(ano, mes, 0, 23, 59, 59);

    const tarefas = await prisma.tarefa.findMany({
      where: {
        usuarioId: req.usuarioId,
        dataEntrega: {
          gte: dataInicio,
          lte: dataFim
        }
      },
      orderBy: {
        dataEntrega: 'asc'
      }
    });

    // Agrupar tarefas por dia
    const tarefasPorDia = {};
    
    tarefas.forEach(tarefa => {
      const dia = formatarData(tarefa.dataEntrega);
      
      if (!tarefasPorDia[dia]) {
        tarefasPorDia[dia] = [];
      }
      
      tarefasPorDia[dia].push({
        ...tarefa,
        diasRestantes: calcularDiasRestantes(tarefa.dataEntrega)
      });
    });

    res.json({
      sucesso: true,
      dados: tarefasPorDia
    });
  } catch (error) {
    console.error('Erro ao obter calendário:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter calendário'
    });
  }
};

/**
 * Obter estatísticas
 */
export const obterEstatisticas = async (req, res) => {
  try {
    const isProfessor = req.usuarioRole === 'PROFESSOR';
    const whereBase = isProfessor
      ? { criadoPorId: req.usuarioId }
      : { usuarioId: req.usuarioId };

    // Total de tarefas
    const totalTarefas = await prisma.tarefa.count({ where: whereBase });

    // Tarefas concluídas
    const tarefasConcluidas = await prisma.tarefa.count({
      where: { ...whereBase, status: { in: ['CONCLUIDA', 'AVALIADA'] } }
    });

    // Taxa de conclusão
    const taxaConclusao = totalTarefas > 0
      ? ((tarefasConcluidas / totalTarefas) * 100).toFixed(1)
      : 0;

    // Tarefas avaliadas
    const tarefasAvaliadas = await prisma.tarefa.count({
      where: { ...whereBase, status: 'AVALIADA' }
    });

    // Tarefas pendentes
    const tarefasPendentes = await prisma.tarefa.count({
      where: { ...whereBase, status: 'PENDENTE' }
    });

    // Buscar todas as tarefas avaliadas para calcular média
    const tarefasComNota = await prisma.tarefa.findMany({
      where: { ...whereBase, status: 'AVALIADA', nota: { not: null } },
      select: {
        id: true,
        titulo: true,
        disciplina: true,
        nota: true,
        feedbackProfessor: true,
        dataEntrega: true,
        dataConclusao: true,
        usuario: { select: { nome: true } },
        criadoPor: { select: { nome: true } }
      },
      orderBy: { atualizadoEm: 'desc' }
    });

    const somaNotas = tarefasComNota.reduce((acc, t) => acc + (t.nota || 0), 0);
    const mediaNotas = tarefasComNota.length > 0
      ? (somaNotas / tarefasComNota.length).toFixed(1)
      : 0;

    // Notas por disciplina
    const notasPorDisciplina = {};
    tarefasComNota.forEach(t => {
      if (!notasPorDisciplina[t.disciplina]) {
        notasPorDisciplina[t.disciplina] = { soma: 0, count: 0 };
      }
      notasPorDisciplina[t.disciplina].soma += t.nota;
      notasPorDisciplina[t.disciplina].count += 1;
    });
    const mediasPorDisciplina = Object.entries(notasPorDisciplina).map(([disc, v]) => ({
      disciplina: disc,
      media: parseFloat((v.soma / v.count).toFixed(1)),
      total: v.count
    })).sort((a, b) => b.media - a.media);

    // Distribuição por disciplina
    const porDisciplina = await prisma.tarefa.groupBy({
      by: ['disciplina'],
      where: whereBase,
      _count: { id: true },
      orderBy: { _count: { id: 'desc' } }
    });

    res.json({
      sucesso: true,
      dados: {
        totalTarefas,
        tarefasConcluidas,
        tarefasPendentes,
        tarefasAvaliadas,
        taxaConclusao: parseFloat(taxaConclusao),
        mediaNotas: parseFloat(mediaNotas),
        tarefasComNota,
        mediasPorDisciplina,
        porDisciplina
      }
    });
  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      sucesso: false,
      mensagem: 'Erro ao obter estatísticas'
    });
  }
};
