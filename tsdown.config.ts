import { execFileSync } from 'node:child_process'
import { Rolldown, type UserConfig } from 'tsdown'
import { clientBundle } from './build/tsdown.client.ts'

const ID = '@deepseek-ai/dsh-client-ui-skin-internet-angel-desktop'

function dshVersion(): string {
  try {
    const output = process.platform === 'win32'
      ? execFileSync(process.env.ComSpec ?? 'cmd.exe', ['/d', '/s', '/c', 'dsh --version'], {
          encoding: 'utf8',
          windowsHide: true,
        })
      : execFileSync('dsh', ['--version'], { encoding: 'utf8' })

    return output
      .trim()
      .replace(/^v/i, '')
      .replace(/-rc\./i, 'rc')
  } catch {
    return 'DSH'
  }
}

export default (): UserConfig[] => clientBundle(ID, ['src/index.ts'])().map(config => config.name === `${ID}/client`
  ? {
      ...config,
      define: {
        ...config.define,
        __DSH_VERSION__: JSON.stringify(dshVersion()),
      },
      plugins: [
        config.plugins,
        {
          name: 'internet-angel-portable-css-region-labels',
          renderChunk(code) {
            return new Rolldown.RolldownMagicString(code).replace(
              /\\0dsh-skin-css:[^\r\n]*?[\\/]src[\\/]client[\\/]([^\\/\r\n]+\.module\.css)\.mjs/g,
              '\\0dsh-skin-css:src/client/$1.mjs',
            )
          },
        },
      ],
    }
  : config)
