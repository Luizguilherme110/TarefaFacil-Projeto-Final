import cron from 'node-cron';
import prisma from '../config/database.js';
import { enviarLembreteTarefa } from './emailService.js';

/**
 * Enviar notificações de tarefas
 */
export const enviarNotificacoesPendentes = async () => {
  try {
    console.log('🔔 Verificando notificações pendentes...');

    const hoje = new Date();
    hoje.setHours(0, 0, 0, 0);

    const amanha = new Date(hoje);
    amanha.setDate(amanha.getDate() + 1);

    // Buscar notificações não enviadas
    const notificacoes = await prisma.notificacao.findMany({
      where: {
        enviada: false
      },
      include: {
        tarefa: {
          include: {
            usuario: true
          }
        }
      }
    });

    let enviadas = 0;

    for (const notificacao of notificacoes) {
      const { tarefa, tipo } = notificacao;
      
      // Verificar se o usuário tem notificações ativas
      if (!tarefa.usuario.notificacoesAtivas) {
        continue;
      }

      // Verificar se a tarefa já foi concluída
      if (tarefa.status === 'CONCLUIDA') {
        // Marcar como enviada para não processar novamente
        await prisma.notificacao.update({
          where: { id: notificacao.id },
          data: { enviada: true }
        });
        continue;
      }

      const dataEntrega = new Date(tarefa.dataEntrega);
      dataEntrega.setHours(0, 0, 0, 0);

      let deveEnviar = false;

      // Verificar se deve enviar a notificação
      if (tipo === 'DIA_ANTES') {
        // Enviar se amanhã é a data de entrega
        deveEnviar = dataEntrega.getTime() === amanha.getTime();
      } else if (tipo === 'DIA_ENTREGA') {
        // Enviar se hoje é a data de entrega
        deveEnviar = dataEntrega.getTime() === hoje.getTime();
      }

      if (deveEnviar) {
        try {
          await enviarLembreteTarefa(tarefa.usuario, tarefa, tipo);
          
          // Marcar como enviada
          await prisma.notificacao.update({
            where: { id: notificacao.id },
            data: {
              enviada: true,
              dataEnvio: new Date()
            }
          });

          enviadas++;
          console.log(`✅ Notificação enviada: ${tipo} - ${tarefa.titulo}`);
        } catch (error) {
          console.error(`❌ Erro ao enviar notificação ${notificacao.id}:`, error);
        }
      }
    }

    console.log(`📊 Total de notificações enviadas: ${enviadas}`);
    return enviadas;
  } catch (error) {
    console.error('❌ Erro ao processar notificações:', error);
    throw error;
  }
};

/**
 * Iniciar agendador de notificações
 */
export const iniciarAgendador = () => {
  // Executar todos os dias às 9h (horário padrão)
  const horarioPadrao = process.env.NOTIFICATION_HOUR || 9;
  const cronExpression = `0 ${horarioPadrao} * * *`;

  console.log(`⏰ Agendador de notificações iniciado (${cronExpression})`);

  cron.schedule(cronExpression, async () => {
    console.log('⏰ Executando tarefa agendada de notificações...');
    await enviarNotificacoesPendentes();
  });

  // Opcional: executar também a cada 6 horas para maior precisão
  cron.schedule('0 */6 * * *', async () => {
    console.log('⏰ Verificação periódica de notificações...');
    await enviarNotificacoesPendentes();
  });
};

/**
 * Executar notificações manualmente (para testes)
 */
export const executarNotificacoesManualmente = async () => {
  console.log('🔧 Executando notificações manualmente...');
  return await enviarNotificacoesPendentes();
};
