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
    const where = {
      usuarioId: req.usuarioId
    };

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
        }
      }
    });

    // Adicionar informações extras às tarefas
    const tarefasComExtras = tarefas.map(tarefa => ({
      ...tarefa,
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
 * Criar nova tarefa
 */
export const criarTarefa = async (req, res) => {
  try {
    const { titulo, descricao, disciplina, prioridade, dataEntrega } = req.body;

    const tarefa = await prisma.tarefa.create({
      data: {
        titulo,
        descricao,
        disciplina,
        prioridade: prioridade.toUpperCase(),
        dataEntrega: new Date(dataEntrega),
        usuarioId: req.usuarioId
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
        status: 'PENDENTE',
        dataConclusao: null
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
    // Total de tarefas criadas
    const totalTarefas = await prisma.tarefa.count({
      where: { usuarioId: req.usuarioId }
    });

    // Tarefas concluídas
    const tarefasConcluidas = await prisma.tarefa.count({
      where: {
        usuarioId: req.usuarioId,
        status: 'CONCLUIDA'
      }
    });

    // Taxa de conclusão
    const taxaConclusao = totalTarefas > 0 
      ? ((tarefasConcluidas / totalTarefas) * 100).toFixed(1)
      : 0;

    // Tarefas concluídas no prazo
    const concluidasNoPrazo = await prisma.tarefa.count({
      where: {
        usuarioId: req.usuarioId,
        status: 'CONCLUIDA',
        dataConclusao: {
          lte: prisma.tarefa.fields.dataEntrega
        }
      }
    });

    // Taxa de sucesso (conclusão no prazo)
    const taxaSucesso = tarefasConcluidas > 0
      ? ((concluidasNoPrazo / tarefasConcluidas) * 100).toFixed(1)
      : 0;

    // Disciplina com mais tarefas
    const porDisciplina = await prisma.tarefa.groupBy({
      by: ['disciplina'],
      where: { usuarioId: req.usuarioId },
      _count: { id: true },
      orderBy: {
        _count: {
          id: 'desc'
        }
      }
    });

    res.json({
      sucesso: true,
      dados: {
        totalTarefas,
        tarefasConcluidas,
        taxaConclusao: parseFloat(taxaConclusao),
        concluidasNoPrazo,
        taxaSucesso: parseFloat(taxaSucesso),
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
