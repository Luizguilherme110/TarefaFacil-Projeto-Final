import { z } from 'zod';

/**
 * Validação para cadastro de usuário
 */
export const cadastroSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres'),
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres'),
  senha: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos uma letra')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
  role: z.enum(['ALUNO', 'PROFESSOR']).optional(),
});

/**
 * Validação para login
 */
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  senha: z.string().min(1, 'Senha é obrigatória'),
});

/**
 * Validação para criar/editar tarefa
 */
export const tarefaSchema = z.object({
  titulo: z.string()
    .min(1, 'Título é obrigatório')
    .max(100, 'Título deve ter no máximo 100 caracteres'),
  descricao: z.string()
    .max(500, 'Descrição deve ter no máximo 500 caracteres')
    .optional()
    .nullable(),
  disciplina: z.string()
    .min(1, 'Disciplina é obrigatória')
    .max(50, 'Disciplina deve ter no máximo 50 caracteres'),
  prioridade: z.enum(['ALTA', 'MEDIA', 'BAIXA'], {
    errorMap: () => ({ message: 'Prioridade deve ser ALTA, MEDIA ou BAIXA' })
  }),
  dataEntrega: z.string()
    .refine((data) => !isNaN(Date.parse(data)), 'Data inválida')
    .refine((data) => {
      const dataEntrega = new Date(data);
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);
      return dataEntrega >= hoje;
    }, 'Data de entrega não pode ser anterior a hoje'),
  alunoId: z.number().int().positive().optional().nullable(),
  valorPontos: z.number().min(0, 'Valor deve ser positivo').max(1000, 'Valor máximo é 1000').optional().nullable(),
});

/**
 * Validação para atualizar perfil
 */
export const atualizarPerfilSchema = z.object({
  nome: z.string()
    .min(3, 'Nome deve ter no mínimo 3 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .optional(),
  email: z.string()
    .email('Email inválido')
    .max(100, 'Email deve ter no máximo 100 caracteres')
    .optional(),
});

/**
 * Validação para alterar senha
 */
export const alterarSenhaSchema = z.object({
  senhaAtual: z.string().min(1, 'Senha atual é obrigatória'),
  novaSenha: z.string()
    .min(8, 'Nova senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Nova senha deve conter pelo menos uma letra')
    .regex(/[0-9]/, 'Nova senha deve conter pelo menos um número'),
});

/**
 * Validação para recuperação de senha
 */
export const recuperarSenhaSchema = z.object({
  email: z.string().email('Email inválido'),
});

/**
 * Validação para redefinir senha
 */
export const redefinirSenhaSchema = z.object({
  token: z.string().min(1, 'Token é obrigatório'),
  novaSenha: z.string()
    .min(8, 'Senha deve ter no mínimo 8 caracteres')
    .regex(/[a-zA-Z]/, 'Senha deve conter pelo menos uma letra')
    .regex(/[0-9]/, 'Senha deve conter pelo menos um número'),
});

/**
 * Middleware para validar dados com Zod
 */
export const validar = (schema) => {
  return (req, res, next) => {
    try {
      schema.parse(req.body);
      next();
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          sucesso: false,
          mensagem: 'Erro de validação',
          erros: error.errors.map(err => ({
            campo: err.path.join('.'),
            mensagem: err.message
          }))
        });
      }
      next(error);
    }
  };
};
