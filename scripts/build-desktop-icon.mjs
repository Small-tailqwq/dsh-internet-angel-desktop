import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'

// Preserve the existing pixel art byte-for-byte in PNG-compressed ICO entries.
const entries = [
  ['../assets/source/ngo-web-icon.png', 32],
  ['../assets/source/ngo-web-icon-192.png', 192],
].map(([path, size]) => ({ data: readFileSync(new URL(path, import.meta.url)), size }))
const header = Buffer.alloc(6 + entries.length * 16)
header.writeUInt16LE(1, 2)
header.writeUInt16LE(entries.length, 4)
let offset = header.length
for (const [index, { data, size }] of entries.entries()) {
  if (data.readUInt32BE(16) !== size || data.readUInt32BE(20) !== size) {
    throw new Error(`Expected a ${size} × ${size} PNG`)
  }
  const start = 6 + index * 16
  header[start] = size
  header[start + 1] = size
  header.writeUInt16LE(1, start + 4)
  header.writeUInt16LE(32, start + 6)
  header.writeUInt32LE(data.length, start + 8)
  header.writeUInt32LE(offset, start + 12)
  offset += data.length
}
mkdirSync(new URL('../assets/icons/', import.meta.url), { recursive: true })
writeFileSync(new URL('../assets/icons/internet-angel.ico', import.meta.url),
  Buffer.concat([header, ...entries.map(entry => entry.data)]))
