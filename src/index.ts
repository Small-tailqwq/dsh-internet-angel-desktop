/**
 * Host half of Internet Angel Desktop: serves the packaged artwork, audio and
 * fonts that the browser half references by content hash.
 *
 * Paths come from the shipped allowlist, never from disk traversal. Files are
 * public, immutable presentation assets (no user data), so they carry a
 * one-year immutable cache. The route is owned by the activation and released
 * with it.
 */
import { readFile } from 'node:fs/promises'
import type { IncomingMessage, ServerResponse } from 'node:http'
import type { Context } from 'cordis'
import files from '../assets/runtime/manifest.json'

/** Must match `SKIN_ASSET_ROUTE` in src/client/skin-asset.ts. */
export const SKIN_ASSET_PREFIX = '/skin-assets/internet-angel-desktop'

const CONTENT_TYPES: Record<string, string> = {
  png: 'image/png',
  ogg: 'audio/ogg',
  wav: 'audio/wav',
  woff2: 'font/woff2',
}
const FILE_NAME = /^[a-f0-9]{64}\.(png|ogg|wav|woff2)$/

interface AssetServer {
  register(route: { kind: 'prefix', path: string, handler: (req: IncomingMessage, res: ServerResponse) => Promise<void> }): () => void
}

/** One satisfiable `bytes=` range, or undefined for a full response. */
function parseRange(header: string | undefined, size: number): { start: number, end: number } | null | undefined {
  if (header === undefined) return undefined
  const match = /^bytes=(\d*)-(\d*)$/.exec(header.trim())
  if (match === null || (match[1] === '' && match[2] === '')) return undefined
  let start: number
  let end: number
  if (match[1] === '') {
    start = Math.max(0, size - Number(match[2]))
    end = size - 1
  } else {
    start = Number(match[1])
    end = match[2] === '' ? size - 1 : Math.min(size - 1, Number(match[2]))
  }
  return start <= end && start < size ? { start, end } : null
}

/**
 * Build the request handler for one asset directory.
 * @param directory - Folder holding the allowlisted files.
 * @param allowlist - `<sha256>.<ext>` names from the runtime manifest.
 */
export function createSkinAssetHandler(directory: URL, allowlist: readonly string[]) {
  const allowed = new Set(allowlist)
  return async (req: IncomingMessage, res: ServerResponse): Promise<void> => {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end()
      return
    }
    const pathname = new URL(req.url ?? '/', 'http://localhost').pathname
    const file = pathname.slice(SKIN_ASSET_PREFIX.length + 1)
    const extension = FILE_NAME.exec(file)?.[1]
    if (!pathname.startsWith(`${SKIN_ASSET_PREFIX}/`) || !allowed.has(file) || extension === undefined) {
      res.writeHead(404).end()
      return
    }
    let bytes: Buffer
    try {
      bytes = await readFile(new URL(file, directory))
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error
      res.writeHead(404).end()
      return
    }
    const etag = `"${file.slice(0, 64)}"`
    const headers = {
      'Content-Type': CONTENT_TYPES[extension]!,
      'Cache-Control': 'public, max-age=31536000, immutable',
      'X-Content-Type-Options': 'nosniff',
      'Accept-Ranges': 'bytes',
      ETag: etag,
    }
    const ifNoneMatch = req.headers['if-none-match']
    if (ifNoneMatch?.split(',').some(value => value.trim().replace(/^W\//, '') === etag || value.trim() === '*')) {
      res.writeHead(304, headers).end()
      return
    }
    // Media elements seek and loop with byte ranges.
    const range = parseRange(req.headers.range, bytes.length)
    if (range === null) {
      res.writeHead(416, { ...headers, 'Content-Range': `bytes */${bytes.length}` }).end()
      return
    }
    const body = range === undefined ? bytes : bytes.subarray(range.start, range.end + 1)
    res.writeHead(range === undefined ? 200 : 206, {
      ...headers,
      'Content-Length': body.length,
      ...(range === undefined ? {} : { 'Content-Range': `bytes ${range.start}-${range.end}/${bytes.length}` }),
    })
    res.end(req.method === 'HEAD' ? undefined : body)
  }
}

/** Serve this package's assets while the skin is enabled. */
export function apply(ctx: Context): void {
  const handler = createSkinAssetHandler(new URL('../assets/runtime/', import.meta.url), files)
  ctx.inject(['webServer'], (webCtx) => {
    const server = webCtx.get('webServer') as AssetServer
    webCtx.effect(() => server.register({ kind: 'prefix', path: SKIN_ASSET_PREFIX, handler }), 'internet-angel-desktop: packaged assets')
  })
}
