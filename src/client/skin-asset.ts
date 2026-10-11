/**
 * Runtime descriptor for one packaged asset. The bytes live in
 * `assets/runtime/` and are served by the node half under
 * `skin-assets/internet-angel-desktop/`; resolving against `document.baseURI`
 * keeps reverse-proxy mounts and the desktop shell's `dsh-app://` forwarding.
 */
export const SKIN_ASSET_ROUTE = 'skin-assets/internet-angel-desktop'

export interface SkinAsset {
  /** Absolute URL for `src`, `Audio`, `fetch` and `@font-face`. */
  readonly url: string
  /** The same URL as a CSS `url()` value. */
  readonly cssUrl: string
  readonly mime: string
  /** Pixel size for images; 0 for audio and fonts. */
  readonly width: number
  readonly height: number
  readonly sha256: string
}

/**
 * Describe one runtime file.
 * @param file - `<sha256>.<ext>` as listed in `assets/runtime/manifest.json`.
 */
export function skinAsset(file: string, mime: string, width: number, height: number): SkinAsset {
  // Resolved on first use, so importing the module needs no document.
  let url: string | undefined
  const resolve = (): string => url ??= new URL(`${SKIN_ASSET_ROUTE}/${file}`, document.baseURI).href
  return {
    get url() { return resolve() },
    get cssUrl() { return `url(${JSON.stringify(resolve())})` },
    mime,
    width,
    height,
    sha256: file.slice(0, 64),
  }
}
