export const receberLog = (req, res) => {
  const { tipo = 'client', mensagem, stack, url, userAgent } = req.body || {}
  console.error('--- Frontend error log ---')
  console.error('Tipo:', tipo)
  console.error('Mensagem:', mensagem)
  if (stack) console.error('Stack:', stack)
  if (url) console.error('URL:', url)
  if (userAgent) console.error('User-Agent:', userAgent)
  console.error('--- end log ---')

  res.json({ sucesso: true })
}
