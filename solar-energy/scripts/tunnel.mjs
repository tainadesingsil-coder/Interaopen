import fs from 'node:fs'
import path from 'node:path'

const { default: localtunnel } = await import('localtunnel')

const PORT = Number(process.env.PORT || 5173)
const OUT = path.resolve(process.cwd(), 'public-url.txt')

const tunnel = await localtunnel({ port: PORT })

const url = tunnel.url
fs.writeFileSync(OUT, url)
console.log(`[tunnel] Public URL: ${url}`)

process.on('SIGINT', () => {
  try { tunnel.close() } catch {}
  process.exit(0)
})

// keep process alive
setInterval(() => {}, 1 << 30)

