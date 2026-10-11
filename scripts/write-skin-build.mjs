import { createHash } from 'node:crypto'
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, renameSync, writeFileSync } from 'node:fs'
import { resolve } from 'node:path'

const [skinRootArg, repository] = process.argv.slice(2)

if (!skinRootArg || !repository || !/^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/.test(repository)) {
  console.error('usage: node scripts/write-skin-build.mjs <skin-root> <owner/repo>')
  process.exitCode = 2
} else {
  const skinRoot = resolve(skinRootArg)
  const manifestPath = resolve(skinRoot, 'skin.json')
  const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
  if (typeof manifest.dshCompatibility !== 'string' || !/^\d+\.\d+\.\d+rc\d+$/.test(manifest.dshCompatibility)) {
    throw new Error('skin.json.dshCompatibility must use x.y.zrcN form (for example 0.1.1rc2)')
  }
  const relPath = '.'
  let sourceCommit
  try {
    const candidate = execFileSync('git', ['rev-parse', 'HEAD'], {
      cwd: skinRoot,
      encoding: 'utf8',
      timeout: 5000,
    }).trim()
    if (/^[0-9a-f]{40}$/.test(candidate)) sourceCommit = candidate
  } catch {
    // A source archive can still produce a valid fingerprint; without a Git
    // ancestry anchor the manager conservatively reports differing builds as
    // incomparable instead of guessing an update direction.
  }
  const inputs = ['lib/client.js', 'lib/index.js', 'cordis.patch.yml', 'skin.json']
  const hash = createHash('sha256')

  for (const input of inputs) {
    const file = resolve(skinRoot, input)
    if (!existsSync(file)) throw new Error(`skin build fingerprint input is missing: ${input}`)
    const normalized = readFileSync(file, 'utf8').replaceAll('\r\n', '\n')
    hash.update(`${input}\0${Buffer.byteLength(normalized)}\0`)
    hash.update(normalized)
  }

  hashRuntimeAssets(hash, skinRoot)

  const output = `${JSON.stringify({
    schema: 1,
    fingerprint: hash.digest('hex'),
    ...(sourceCommit === undefined ? {} : { sourceCommit }),
    repository,
    path: relPath,
  }, null, 2)}\n`
  const target = resolve(skinRoot, 'skin.build.json')
  const temporary = `${target}.tmp`
  writeFileSync(temporary, output)
  renameSync(temporary, target)
}

/**
 * Packaged runtime files are fingerprinted like dsh-deep-whale's
 * `scripts/skin-asset-inputs.mjs`, which the skin manager uses to recompute
 * an installed skin's fingerprint: the manifest text, then every listed file
 * in sorted order, each verified against its content-hash name.
 */
function hashRuntimeAssets(hash, skinRoot) {
  const manifest = 'assets/runtime/manifest.json'
  if (!existsSync(resolve(skinRoot, manifest))) return
  const text = readFileSync(resolve(skinRoot, manifest), 'utf8').replaceAll('\r\n', '\n')
  const files = JSON.parse(text)
  if (!Array.isArray(files) || files.some(file => typeof file !== 'string' || !/^[a-f0-9]{64}\.(webp|png|ogg|wav|woff2)$/.test(file))) {
    throw new Error('Invalid skin runtime asset manifest')
  }
  hash.update(`${manifest}\0${Buffer.byteLength(text)}\0`).update(text)
  for (const file of [...new Set(files)].sort()) {
    const input = `assets/runtime/${file}`
    const bytes = readFileSync(resolve(skinRoot, input))
    if (createHash('sha256').update(bytes).digest('hex') !== file.split('.')[0]) throw new Error(`Runtime asset content hash mismatch: ${file}`)
    hash.update(`${input}\0${bytes.length}\0`).update(bytes)
  }
}
