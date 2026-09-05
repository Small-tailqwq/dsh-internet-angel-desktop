# Asset attribution and ownership report

This report separates project contributions from third-party assets. It records provenance;
it does not grant a license or certify that every embedded asset is cleared for redistribution.

## Source notation

Private locations are intentionally generalized as **[game installation]**, **[client installation]**,
**[community archive]**, **[extraction workspace]**, and **[user-supplied capture]**.
These labels identify source categories without exposing usernames, drive letters or local directories.
Resource names, versions and hashes below remain available for attribution and comparison.

## Ownership inventory

| Asset family | Creator / rights holder | Provenance and use | Rights status |
| --- | --- | --- | --- |
| NEEDY GIRL OVERDOSE | WSS playground and respective game rights holders | [game installation]: desktop artwork, character frames, window chrome, icons, cursor, startup visuals, short sound effects and desktop music | Third-party game assets; this project does not own or license them. Redistribution permission is not established by this report. |
| The Binding of Isaac: Repentance | Nicalis, Edmund McMillen and respective rights holders | [game installation] and [extraction workspace]: pixel artwork, animation definitions and short sound clips used in desktop interactions | Third-party game assets; extraction and conversion confer no additional permission. |
| Terraria | Re-Logic and respective rights holders | [game installation], official Terraria Wiki and user-provided resources: item/status icons and a short use sound | Third-party assets; no project-granted redistribution or commercial license. |
| Minecraft | Mojang Studios and respective rights holders | Official Java Edition 26.2 client resources and asset index: item/status textures and short item sounds | Third-party assets; no project-granted redistribution or commercial license. |
| Steam | Valve Corporation | [client installation]: desktop notification audio and two original visual masks | Third-party client assets; no affiliation or license is implied. |
| DinkieBitmap 9px | Original font creator / rights holder; full permission chain requires confirmation | [community archive]: TTF source converted to WOFF2 | The archive is not evidence of a font redistribution or conversion license. This permission remains unverified. |
| Zpix | SolidZORO | Official, unmodified WOFF2 release v3.1.11 | Consult the [author's terms](https://github.com/SolidZORO/zpix-pixel-font); this project grants no additional rights. |
| Generated notepad and action icons | AI-generated material directed by the project contributors | Generated with OpenAI image tools on 2026-08-20 and 2026-08-27; cropped/resized for the interface | Recorded as generated project material, without claiming ownership of third-party motifs or exclusive rights to generated output. |
| README promotional screenshot | User-supplied capture; underlying UI/game assets retain their respective owners | [user-supplied capture], dated 2026-09-05; included at the user's direction | Permission to use the capture does not transfer the embedded third-party asset rights. |

## Identification and transformations

- NEEDY GIRL OVERDOSE graphics originate from game textures, scene resources and Addressables animation bundles.
  Sound effects and `BGM_mainloop_normal` originate from AudioClips in `sharedassets0` and are decoded/transcoded
  for browser playback. The application icon is extracted from `Windose.exe`; larger variants use nearest-neighbor scaling.
  Community reference copies are cross-checked against the corresponding game resources where recorded.
- Isaac animation identifiers and frame triggers are preserved in private provenance records and generated frame metadata.
  Cropping, original layer transforms/tints and nearest-neighbor scaling retain the source pixel style.
  Original sound groups include 40 and 182; sound variants are copied from the corresponding game samples.
  The desktop's interaction rules are project-authored and do not claim to reproduce the full game simulation.
- Minecraft item sounds retain asset-index hashes `ebf6fcfa3dd26d6f684fd90388221d4ee4a1af1d`
  and `ed402bb1c240a70fa9eb05fe5eec436c248598f2`. Textures retain their original pixel dimensions before display scaling.
- Terraria resources include the Gravity Potion and associated status icon, plus additional item/status artwork.
  Wiki provenance identifies the source of a copy, not a license for every underlying game texture.
- Steam's notification sample is `desktop_toast_default.wav`. Its visual masks are extracted from the installed
  client stylesheet. Project-created desktop notifications are not real Steam achievements or platform records.
- Zpix v3.1.11 WOFF2 SHA-256: `ad5f0649090e476f9944ce19cbb174bc56aabf6c0ad8bb405bd5d56b522f2154`.
  The supplied WOFF2 is embedded unchanged. The community font has a separate, unverified permission chain.

Per-asset identifiers and source descriptions are retained in the repository's asset manifest.
Private source locations use the category notation above. Research and extraction utilities are maintained privately and are not included in this repository.

## Distribution boundary

The skin remains in development/testing. This report is not a clearance certificate for a public release.
Game/client extraction evidence establishes where a resource came from; it does not establish permission
for public redistribution. Font permissions and third-party asset clearance require separate confirmation.

Source visibility, project ownership, third-party asset ownership and permission to redistribute are separate matters.
The project makes no claim of affiliation or endorsement and grants no third-party commercial-use rights.
Rights holders may request an attribution correction or asset removal through the repository issue tracker.
