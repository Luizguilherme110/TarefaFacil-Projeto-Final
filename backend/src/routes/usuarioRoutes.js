import express from 'express';
import {
  listarAlunos,
  obterPerfil,
  atualizarPerfil,
  alterarSenha,
  atualizarPreferencias,
  excluirConta
} from '../controllers/usuarioController.js';
import { verificarAuth, verificarRole } from '../middlewares/auth.js';
import {
  validar,
  atualizarPerfilSchema,
  alterarSenhaSchema
} from '../middlewares/validacao.js';

const router = express.Router();

// Todas as rotas de usuário requerem autenticação
router.use(verificarAuth);

/**
 * @route   GET /api/usuarios/alunos
 * @desc    Listar todos os alunos (apenas professor)
 * @access  Private (PROFESSOR)
 */
router.get('/alunos', verificarRole('PROFESSOR'), listarAlunos);

/**
 * @route   GET /api/usuarios/perfil
 * @desc    Obter perfil do usuário logado
 * @access  Private
 */
router.get('/perfil', obterPerfil);

/**
 * @route   PUT /api/usuarios/perfil
 * @desc    Atualizar perfil do usuário
 * @access  Private
 */
router.put('/perfil', validar(atualizarPerfilSchema), atualizarPerfil);

/**
 * @route   PUT /api/usuarios/senha
 * @desc    Alterar senha do usuário
 * @access  Private
 */
router.put('/senha', validar(alterarSenhaSchema), alterarSenha);

/**
 * @route   PUT /api/usuarios/preferencias
 * @desc    Atualizar preferências de notificações
 * @access  Private
 */
router.put('/preferencias', atualizarPreferencias);

/**
 * @route   DELETE /api/usuarios/conta
 * @desc    Excluir conta do usuário
 * @access  Private
 */
router.delete('/conta', excluirConta);

export default router;
