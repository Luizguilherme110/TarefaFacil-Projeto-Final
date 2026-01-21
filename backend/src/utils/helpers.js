/**
 * Calcular dias restantes até uma data
 */
export const calcularDiasRestantes = (dataEntrega) => {
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const entrega = new Date(dataEntrega);
  entrega.setHours(0, 0, 0, 0);
  
  const diferencaMs = entrega - hoje;
  const diferencaDias = Math.ceil(diferencaMs / (1000 * 60 * 60 * 24));
  
  return diferencaDias;
};

/**
 * Formatar data para YYYY-MM-DD
 */
export const formatarData = (data) => {
  const d = new Date(data);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  
  return `${ano}-${mes}-${dia}`;
};

/**
 * Formatar data para exibição (DD/MM/YYYY)
 */
export const formatarDataBR = (data) => {
  const d = new Date(data);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  
  return `${dia}/${mes}/${ano}`;
};

/**
 * Verificar se a data é hoje
 */
export const ehHoje = (data) => {
  return formatarData(data) === formatarData(new Date());
};

/**
 * Verificar se a tarefa está atrasada
 */
export const estaAtrasada = (dataEntrega, status) => {
  if (status === 'CONCLUIDA') return false;
  
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  
  const entrega = new Date(dataEntrega);
  entrega.setHours(0, 0, 0, 0);
  
  return entrega < hoje;
};

/**
 * Obter texto amigável de dias restantes
 */
export const textodiasRestantes = (diasRestantes) => {
  if (diasRestantes < 0) {
    return `Atrasada há ${Math.abs(diasRestantes)} ${Math.abs(diasRestantes) === 1 ? 'dia' : 'dias'}`;
  }
  
  if (diasRestantes === 0) {
    return 'Vence hoje';
  }
  
  if (diasRestantes === 1) {
    return 'Vence amanhã';
  }
  
  return `Faltam ${diasRestantes} dias`;
};

/**
 * Sanitizar string (prevenir XSS)
 */
export const sanitizarString = (str) => {
  if (!str) return '';
  
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

/**
 * Validar email
 */
export const validarEmail = (email) => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Gerar slug a partir de texto
 */
export const gerarSlug = (texto) => {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/--+/g, '-')
    .trim();
};
