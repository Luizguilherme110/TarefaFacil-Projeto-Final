import express from 'express';
import { verificarAuth } from '../middlewares/auth.js';
import {
  listarConversas,
  listarMensagens,
  enviarMensagem
} from '../controllers/chatController.js';

const router = express.Router();

router.use(verificarAuth);

router.get('/conversas', listarConversas);
router.get('/mensagens/:contatoId', listarMensagens);
router.post('/mensagens/:contatoId', enviarMensagem);

export default router;
