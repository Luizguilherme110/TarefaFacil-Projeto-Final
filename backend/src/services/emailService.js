import nodemailer from 'nodemailer';

/**
 * Configurar transporter do Nodemailer
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true para 465, false para outras portas
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

/**
 * Verificar configuração do email
 */
export const verificarConfiguracao = async () => {
  try {
    await transporter.verify();
    console.log('✅ Servidor de email configurado e pronto');
    return true;
  } catch (error) {
    console.error('❌ Erro na configuração do email:', error.message);
    return false;
  }
};

/**
 * Enviar email
 */
export const enviarEmail = async ({ para, assunto, html, texto }) => {
  try {
    const info = await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: para,
      subject: assunto,
      text: texto,
      html: html
    });

    console.log('📧 Email enviado:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Erro ao enviar email:', error);
    throw error;
  }
};

/**
 * Enviar lembrete de tarefa
 */
export const enviarLembreteTarefa = async (usuario, tarefa, tipo) => {
  const diasMap = {
    DIA_ANTES: 'amanhã',
    DIA_ENTREGA: 'hoje'
  };

  const emojiMap = {
    ALTA: '🔴',
    MEDIA: '🟡',
    BAIXA: '🟢'
  };

  const dias = diasMap[tipo] || 'em breve';
  const emoji = emojiMap[tarefa.prioridade] || '📌';

  const assunto = `🔔 Lembrete: Tarefa vence ${dias}!`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4F46E5;">Olá ${usuario.nome}!</h2>
      
      <p>Este é um lembrete sobre a seguinte tarefa:</p>
      
      <div style="background-color: #F3F4F6; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="margin-top: 0; color: #1F2937;">
          ${emoji} ${tarefa.titulo}
        </h3>
        
        ${tarefa.descricao ? `<p style="color: #6B7280;">${tarefa.descricao}</p>` : ''}
        
        <p style="margin-bottom: 8px;">
          <strong>Disciplina:</strong> ${tarefa.disciplina}
        </p>
        
        <p style="margin-bottom: 8px;">
          <strong>Prioridade:</strong> ${tarefa.prioridade}
        </p>
        
        <p style="margin-bottom: 0;">
          <strong>Data de Entrega:</strong> ${new Date(tarefa.dataEntrega).toLocaleDateString('pt-BR')}
        </p>
      </div>
      
      <p style="color: #6B7280;">
        ${tipo === 'DIA_ANTES' 
          ? 'Não esqueça! Esta tarefa vence amanhã. Prepare-se com antecedência!' 
          : 'Atenção! Esta tarefa vence hoje. Não deixe para depois!'}
      </p>
      
      <a href="${process.env.FRONTEND_URL}/tarefas" 
         style="display: inline-block; background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 16px 0;">
        Ver Minhas Tarefas
      </a>
      
      <hr style="border: none; border-top: 1px solid #E5E7EB; margin: 32px 0;">
      
      <p style="color: #9CA3AF; font-size: 14px;">
        Você está recebendo este email porque ativou as notificações no TarefaFácil.<br>
        Para gerenciar suas preferências, acesse as configurações da sua conta.
      </p>
      
      <p style="color: #9CA3AF; font-size: 14px;">
        <strong>TarefaFácil</strong> - Organize suas tarefas, alcance seus objetivos! 🎓✨
      </p>
    </div>
  `;

  const texto = `
Olá ${usuario.nome}!

Este é um lembrete sobre a seguinte tarefa:

${tarefa.titulo}
${tarefa.descricao ? tarefa.descricao : ''}

Disciplina: ${tarefa.disciplina}
Prioridade: ${tarefa.prioridade}
Data de Entrega: ${new Date(tarefa.dataEntrega).toLocaleDateString('pt-BR')}

${tipo === 'DIA_ANTES' 
  ? 'Não esqueça! Esta tarefa vence amanhã.' 
  : 'Atenção! Esta tarefa vence hoje.'}

Acesse: ${process.env.FRONTEND_URL}/tarefas

TarefaFácil - Organize suas tarefas, alcance seus objetivos!
  `;

  return enviarEmail({
    para: usuario.email,
    assunto,
    html,
    texto
  });
};
