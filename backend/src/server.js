import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import prisma from './config/database.js';
import { verificarConfiguracao } from './services/emailService.js';
import { iniciarAgendador } from './services/notificacaoService.js';

// Importar rotas
import authRoutes from './routes/authRoutes.js';
import usuarioRoutes from './routes/usuarioRoutes.js';
import tarefaRoutes from './routes/tarefaRoutes.js';

// Carregar variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// ==================== MIDDLEWARES ====================

// CORS - Permitir requisições do frontend
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Parser de JSON
app.use(express.json());

// Parser de URL encoded
app.use(express.urlencoded({ extended: true }));

// Middleware de log (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// ==================== ROTAS ====================

// Rota de saúde (health check)
app.get('/health', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'API TarefaFácil está funcionando!',
    timestamp: new Date().toISOString()
  });
});

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    sucesso: true,
    mensagem: 'Bem-vindo à API TarefaFácil 📚',
    versao: '1.0.0',
    documentacao: '/api/docs'
  });
});

// Rotas da API
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuarioRoutes);
app.use('/api/tarefas', tarefaRoutes);

// ==================== TRATAMENTO DE ERROS ====================

// Rota não encontrada (404)
app.use((req, res) => {
  res.status(404).json({
    sucesso: false,
    mensagem: 'Rota não encontrada'
  });
});

// Middleware de erro global
app.use((error, req, res, next) => {
  console.error('Erro capturado:', error);

  // Erro do Prisma
  if (error.code && error.code.startsWith('P')) {
    return res.status(400).json({
      sucesso: false,
      mensagem: 'Erro no banco de dados',
      detalhes: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }

  // Erro genérico
  res.status(error.status || 500).json({
    sucesso: false,
    mensagem: error.message || 'Erro interno do servidor',
    detalhes: process.env.NODE_ENV === 'development' ? error.stack : undefined
  });
});

// ==================== INICIALIZAÇÃO ====================

const iniciarServidor = async () => {
  try {
    // Verificar conexão com banco de dados
    await prisma.$connect();
    console.log('✅ Conectado ao banco de dados');

    // Verificar configuração de email
    if (process.env.ENABLE_NOTIFICATIONS === 'true') {
      const emailOk = await verificarConfiguracao();
      
      if (emailOk) {
        // Iniciar agendador de notificações
        iniciarAgendador();
        console.log('✅ Agendador de notificações iniciado');
      } else {
        console.warn('⚠️ Email não configurado. Notificações desabilitadas.');
      }
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('');
      console.log('='.repeat(50));
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
      console.log(`📍 URL: http://localhost:${PORT}`);
      console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log('='.repeat(50));
      console.log('');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
};

// Iniciar servidor
iniciarServidor();

// Tratamento de sinais de encerramento
process.on('SIGINT', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Encerrando servidor...');
  await prisma.$disconnect();
  process.exit(0);
});

export default app;
