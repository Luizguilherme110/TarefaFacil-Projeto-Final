// Lista simples de recessos escolares/configuráveis
// Formato: { nome, inicio: 'YYYY-MM-DD', fim: 'YYYY-MM-DD' }
export const recessos = [
  {
    nome: 'Recesso de Julho',
    inicio: `${new Date().getFullYear()}-07-15`,
    fim: `${new Date().getFullYear()}-07-31`
  },
  {
    nome: 'Recesso de Verão',
    inicio: `${new Date().getFullYear()}-12-20`,
    fim: `${new Date().getFullYear() + 1}-01-31`
  }
]

export default recessos
