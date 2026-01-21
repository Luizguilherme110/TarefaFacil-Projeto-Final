/**
 * Formatar data para exibição (DD/MM/YYYY)
 */
export const formatarData = (data) => {
  if (!data) return '';
  const d = new Date(data);
  const dia = String(d.getDate()).padStart(2, '0');
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const ano = d.getFullYear();
  return `${dia}/${mes}/${ano}`;
};

/**
 * Formatar data para input (YYYY-MM-DD)
 */
export const formatarDataInput = (data) => {
  if (!data) return '';
  const d = new Date(data);
  const ano = d.getFullYear();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
};

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
 * Obter texto amigável de dias restantes
 */
export const textoDiasRestantes = (diasRestantes) => {
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
 * Verificar se a tarefa está atrasada
 */
export const estaAtrasada = (dataEntrega, status) => {
  if (status === 'CONCLUIDA') return false;
  return calcularDiasRestantes(dataEntrega) < 0;
};

/**
 * Verificar se a tarefa vence hoje
 */
export const venceHoje = (dataEntrega) => {
  return calcularDiasRestantes(dataEntrega) === 0;
};

/**
 * Obter cor da prioridade
 */
export const corPrioridade = (prioridade) => {
  const cores = {
    ALTA: 'text-red-700 bg-red-100',
    MEDIA: 'text-yellow-700 bg-yellow-100',
    BAIXA: 'text-green-700 bg-green-100'
  };
  return cores[prioridade] || cores.BAIXA;
};

/**
 * Lista de disciplinas escolares
 */
export const DISCIPLINAS = [
  'Matemática',
  'Português',
  'História',
  'Geografia',
  'Ciências',
  'Biologia',
  'Física',
  'Química',
  'Inglês',
  'Espanhol',
  'Educação Física',
  'Artes',
  'Filosofia',
  'Sociologia',
  'Literatura',
  'Redação',
  'Outras'
];

/**
 * Truncar texto
 */
export const truncarTexto = (texto, tamanho = 50) => {
  if (!texto) return '';
  if (texto.length <= tamanho) return texto;
  return texto.substring(0, tamanho) + '...';
};

/**
 * Capitalizar primeira letra
 */
export const capitalizar = (texto) => {
  if (!texto) return '';
  return texto.charAt(0).toUpperCase() + texto.slice(1).toLowerCase();
};
