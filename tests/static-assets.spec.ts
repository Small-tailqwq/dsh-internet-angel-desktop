import { execFileSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { readFileSync } from 'node:fs'
import { createServer, type Server } from 'node:http'
import type { AddressInfo } from 'node:net'
import { afterAll, beforeAll, describe, expect, it } from 'vitest'
import files from '../assets/runtime/manifest.json'
import { createSkinAssetHandler, SKIN_ASSET_PREFIX } from '../src/index.ts'

const runtime = new URL('../assets/runtime/', import.meta.url)
let server: Server
let base: string

beforeAll(async () => {
  const handler = createSkinAssetHandler(runtime, files)
  server = createServer((req, res) => { void handler(req, res) })
  await new Promise<void>(resolve => server.listen(0, '127.0.0.1', resolve))
  base = `http://127.0.0.1:${(server.address() as AddressInfo).port}${SKIN_ASSET_PREFIX}/`
})

afterAll(async () => {
  await new Promise(resolve => server.close(resolve))
})

const pick = (extension: string): string => files.find(file => file.endsWith(`.${extension}`))!

describe('packaged asset route', () => {
  it('serves every media type with its original bytes and an immutable cache', async () => {
    for (const [extension, type] of [['png', 'image/png'], ['ogg', 'audio/ogg'], ['wav', 'audio/wav'], ['woff2', 'font/woff2']] as const) {
      const file = pick(extension)
      const response = await fetch(base + file)
      expect(response.status).toBe(200)
      expect(response.headers.get('content-type')).toBe(type)
      expect(response.headers.get('cache-control')).toBe('public, max-age=31536000, immutable')
      const bytes = Buffer.from(await response.arrayBuffer())
      expect(createHash('sha256').update(bytes).digest('hex')).toBe(file.slice(0, 64))
    }
  })

  it('answers revalidation and byte ranges', async () => {
    const file = pick('ogg')
    const notModified = await fetch(base + file, { headers: { 'if-none-match': `"${file.slice(0, 64)}"` } })
    expect(notModified.status).toBe(304)
    const partial = await fetch(base + file, { headers: { range: 'bytes=4-11' } })
    expect(partial.status).toBe(206)
    const whole = readFileSync(new URL(file, runtime))
    expect(partial.headers.get('content-range')).toBe(`bytes 4-11/${whole.length}`)
    expect(Buffer.from(await partial.arrayBuffer())).toEqual(whole.subarray(4, 12))
    const outside = await fetch(base + file, { headers: { range: `bytes=${whole.length}-` } })
    expect(outside.status).toBe(416)
  })

  it('refuses writes, unlisted names and traversal', async () => {
    const file = pick('png')
    expect((await fetch(base + file, { method: 'POST' })).status).toBe(405)
    expect((await fetch(base + '0'.repeat(64) + '.png')).status).toBe(404)
    expect((await fetch(base + 'manifest.json')).status).toBe(404)
    expect((await fetch(base + '..%2Fpackage.json')).status).toBe(404)
  })

  it('keeps the generated descriptors, runtime manifest and files in sync', () => {
    expect(() => execFileSync(process.execPath, ['scripts/write-skin-art.mjs', '--check'], {
      cwd: new URL('..', import.meta.url),
      stdio: 'pipe',
    })).not.toThrow()
  })
})
