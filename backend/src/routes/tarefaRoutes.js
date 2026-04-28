import express from 'express';
import {
  listarTarefas,
  obterTarefa,
  criarTarefa,
  atualizarTarefa,
  excluirTarefa,
  concluirTarefa,
  reabrirTarefa,
  avaliarTarefa,
  obterNotificacoes,
  obterDashboard,
  obterCalendario,
  obterEstatisticas
} from '../controllers/tarefaController.js';
import { verificarAuth, verificarRole } from '../middlewares/auth.js';
import { validar, tarefaSchema } from '../middlewares/validacao.js';

const router = express.Router();

// Todas as rotas de tarefa requerem autenticação
router.use(verificarAuth);

/**
 * @route   GET /api/tarefas
 * @desc    Listar todas as tarefas do usuário com filtros
 * @access  Private
 */
router.get('/', listarTarefas);

/**
 * @route   GET /api/tarefas/dashboard
 * @desc    Obter dados para o dashboard
 * @access  Private
 */
router.get('/dashboard', obterDashboard);

/**
 * @route   GET /api/tarefas/notificacoes
 * @desc    Obter notificações para o sino do sistema
 * @access  Private
 */
router.get('/notificacoes', obterNotificacoes);

/**
 * @route   GET /api/tarefas/calendario
 * @desc    Obter tarefas para o calendário
 * @access  Private
 */
router.get('/calendario', obterCalendario);

/**
 * @route   GET /api/tarefas/estatisticas
 * @desc    Obter estatísticas do usuário
 * @access  Private
 */
router.get('/estatisticas', obterEstatisticas);

/**
 * @route   GET /api/tarefas/:id
 * @desc    Obter uma tarefa específica
 * @access  Private
 */
router.get('/:id', obterTarefa);

/**
 * @route   POST /api/tarefas
 * @desc    Criar nova tarefa
 * @access  Private
 */
router.post('/', validar(tarefaSchema), verificarRole('PROFESSOR'), criarTarefa);

/**
 * @route   PUT /api/tarefas/:id
 * @desc    Atualizar tarefa
 * @access  Private
 */
router.put('/:id', validar(tarefaSchema), verificarRole('PROFESSOR'), atualizarTarefa);

/**
 * @route   DELETE /api/tarefas/:id
 * @desc    Excluir tarefa
 * @access  Private
 */
router.delete('/:id', verificarRole('PROFESSOR'), excluirTarefa);

/**
 * @route   PATCH /api/tarefas/:id/concluir
 * @desc    Marcar tarefa como concluída
 * @access  Private
 */
router.patch('/:id/concluir', concluirTarefa);

/**
 * @route   PATCH /api/tarefas/:id/reabrir
 * @desc    Reabrir tarefa (marcar como pendente)
 * @access  Private
 */
router.patch('/:id/reabrir', reabrirTarefa);

/**
 * @route   PATCH /api/tarefas/:id/avaliar
 * @desc    Avaliar tarefa (professor dá nota)
 * @access  Private (PROFESSOR)
 */
router.patch('/:id/avaliar', verificarRole('PROFESSOR'), avaliarTarefa);

export default router;
