import bcrypt from 'bcrypt'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const senha = 'Senha123@'
  const senhaHash = await bcrypt.hash(senha, 10)

  const usuarios = [
    { nome: 'Aluno Teste', email: 'aluno@test.com', senha: senhaHash, role: 'ALUNO' },
    { nome: 'Professor Teste', email: 'professor@test.com', senha: senhaHash, role: 'PROFESSOR' }
  ]

  for (const u of usuarios) {
    await prisma.usuario.upsert({
      where: { email: u.email },
      update: { nome: u.nome, senha: u.senha, role: u.role },
      create: u
    })
    console.log(`Usuário criado/atualizado: ${u.email}`)
  }

  console.log('Seed finalizado.')
}

main()
  .catch((e) => {
    console.error('Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
