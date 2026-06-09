import { readFile } from 'fs/promises'
import path from 'path'
import { Hono } from 'hono'
import process from 'process'

const app = new Hono()

// Types for NACE JSON structure
type NaceNode = {
  code: string
  fullCode: string
  section: string
  parent: string | null
  text: string
  children: string[]
}

type NaceData = {
  nodes: Record<string, NaceNode>
}

const loadNaceFile = async (lang: string = 'en'): Promise<NaceData> => {
  const filePath = path.join(process.cwd(), 'naceCodes', `${lang}.json`)
  try {
    const raw = await readFile(filePath, 'utf8')
    const parsed = JSON.parse(raw) as unknown
    return parsed as NaceData
  } catch (err) {
    throw new Error(`Failed to load ${filePath}: ${err}`)
  }
}

const getParentChain = (code: string, data: NaceData): NaceNode[] => {
  const chain: NaceNode[] = []
  let current = data.nodes[code]

  if (current?.parent) {
    current = data.nodes[current.parent]
    while (current) {
      chain.unshift(current)
      if (current.parent) {
        current = data.nodes[current.parent]
      } else {
        break
      }
    }
  }

  return chain
}

const getSiblings = (code: string, data: NaceData): NaceNode[] => {
  const entry = data.nodes[code]
  if (!entry?.parent) return []

  const parentEntry = data.nodes[entry.parent]
  if (!parentEntry) return []

  return parentEntry.children
    .filter(childCode => childCode !== code)
    .map(childCode => data.nodes[childCode])
    .filter((node): node is NaceNode => node !== undefined)
}

app.get('/nace/:lang', async c => {
  const lang = c.req.param('lang') || 'en'

  try {
    const data = await loadNaceFile(lang)
    return c.json(data)
  } catch (err) {
    return c.json({ error: String(err) }, 500)
  }
})

app.get('/nace/:lang/:code/parents', async c => {
  const lang = c.req.param('lang') || 'en'
  const code = c.req.param('code')

  try {
    const data = await loadNaceFile(lang)
    const entry = data.nodes[code]
    if (!entry) return c.json({ error: 'Code not found' }, 404)

    const parents = getParentChain(code, data)
    return c.json({ code: entry, parents })
  } catch (err) {
    return c.json({ error: String(err) }, 500)
  }
})

app.get('/nace/:lang/:code/siblings', async c => {
  const lang = c.req.param('lang') || 'en'
  const code = c.req.param('code')

  try {
    const data = await loadNaceFile(lang)
    const entry = data.nodes[code]
    if (!entry) return c.json({ error: 'Code not found' }, 404)

    const siblings = getSiblings(code, data)
    return c.json({ code: entry, siblings })
  } catch (err) {
    return c.json({ error: String(err) }, 500)
  }
})

app.get('/nace/:lang/:code', async c => {
  const lang = c.req.param('lang') || 'en'
  const code = c.req.param('code')

  try {
    const data = await loadNaceFile(lang)
    const entry = data.nodes[code]
    if (!entry) return c.json({ error: 'Code not found' }, 404)
    return c.json(entry)
  } catch (err) {
    return c.json({ error: String(err) }, 500)
  }
})

export default app
