import fs from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';

const BASE_URL = 'http://localhost:5173';
const OUTPUT_DIR = path.resolve(process.cwd(), '..', 'docs', 'screenshots');

const usuarios = {
  professor: { email: 'professor@test.com', senha: 'Senha123@' },
  aluno: { email: 'aluno@test.com', senha: 'Senha123@' }
};

async function login(page, { email, senha }) {
  await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', senha);
  await page.click('button[type="submit"]');
  await page.waitForURL(`${BASE_URL}/`, { timeout: 15000 });
  await page.waitForTimeout(1200);
}

async function capturar(page, arquivo, rota) {
  await page.goto(`${BASE_URL}${rota}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(1000);
  await page.screenshot({
    path: path.join(OUTPUT_DIR, arquivo),
    fullPage: true
  });
}

async function executar() {
  await fs.mkdir(OUTPUT_DIR, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await context.newPage();

  try {
    await capturar(page, '01-login.png', '/login');
    await capturar(page, '02-cadastro.png', '/cadastro');

    await login(page, usuarios.professor);
    await capturar(page, '03-dashboard-professor.png', '/');
    await capturar(page, '04-tarefas-professor.png', '/tarefas');
    await capturar(page, '05-nova-tarefa-professor.png', '/tarefas/nova');
    await capturar(page, '06-calendario-professor.png', '/calendario');
    await capturar(page, '07-estatisticas-professor.png', '/estatisticas');
    await capturar(page, '08-chat-professor.png', '/chat');
    await capturar(page, '09-perfil-professor.png', '/perfil');

    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await login(page, usuarios.aluno);
    await capturar(page, '10-dashboard-aluno.png', '/');
    await capturar(page, '11-tarefas-aluno.png', '/tarefas');
    await capturar(page, '12-calendario-aluno.png', '/calendario');
    await capturar(page, '13-estatisticas-aluno.png', '/estatisticas');
    await capturar(page, '14-chat-aluno.png', '/chat');
    await capturar(page, '15-perfil-aluno.png', '/perfil');
  } finally {
    await context.close();
    await browser.close();
  }
}

executar()
  .then(() => {
    console.log(`Capturas geradas em: ${OUTPUT_DIR}`);
  })
  .catch((error) => {
    console.error('Erro ao capturar telas:', error);
    process.exit(1);
  });
