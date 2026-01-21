import express from 'express';
import {
  cadastrar,
  login,
  logout,
  solicitarRecuperacaoSenha,
  redefinirSenha
} from '../controllers/authController.js';
import {
  validar,
  cadastroSchema,
  loginSchema,
  recuperarSenhaSchema,
  redefinirSenhaSchema
} from '../middlewares/validacao.js';

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Cadastrar novo usuário
 * @access  Public
 */
router.post('/register', validar(cadastroSchema), cadastrar);

/**
 * @route   POST /api/auth/login
 * @desc    Fazer login
 * @access  Public
 */
router.post('/login', validar(loginSchema), login);

/**
 * @route   POST /api/auth/logout
 * @desc    Fazer logout
 * @access  Public
 */
router.post('/logout', logout);

/**
 * @route   POST /api/auth/forgot
 * @desc    Solicitar recuperação de senha
 * @access  Public
 */
router.post('/forgot', validar(recuperarSenhaSchema), solicitarRecuperacaoSenha);

/**
 * @route   POST /api/auth/reset
 * @desc    Redefinir senha com token
 * @access  Public
 */
router.post('/reset', validar(redefinirSenhaSchema), redefinirSenha);

export default router;
