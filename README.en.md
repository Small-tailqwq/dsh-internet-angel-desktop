# Internet Angel Desktop · 超绝网络天使桌面

npm package: `@smalltailqwq/dsh-client-ui-skin-internet-angel-desktop`

[简体中文](README.md) | English | [日本語](README.ja.md)

**Turn DSH Web into a windose20 desktop.**

An unofficial, non-commercial fan-made skin inspired by *NEEDY STREAMER OVERLOAD*.
Chat in JINE, follow task progress in Task Manager, read results in POKETTER, and keep working across desktop windows.

![Internet Angel Desktop preview](preview/desktop.png)

> **In development · Testing phase**: Features and layouts are still being adjusted. Issues may occur on some devices, browsers, zoom levels, or host versions.

## What's on this desktop

- Draggable, resizable, and minimizable windows, plus a Start menu, taskbar, and access to saved sessions.
- JINE conversations, POKETTER results, and Task Manager give long-running tasks their own place.
- A webcam character display, to-do list, Pomodoro timer, and Chinese and English UI.
- Fonts, characters, and audio can be customized through the skin manager. BGM and sound effects are off by default; turn up their volume if you want to hear them.
- An eclectic assortment of Easter eggs.

## Installation and skin manager

You need a working DSH Web installation. We recommend using the
[skin-manager](https://github.com/Small-tailqwq/dsh-deep-whale/tree/main/skin-manager)
to switch skins and adjust this skin's customization options.

Run these commands in order in your terminal (replace `web` with your profile name):

```powershell
dsh plugin --profile web add 'github:Small-tailqwq/dsh-deep-whale#path:/skin-manager'
dsh plugin --profile web add 'github:Small-tailqwq/dsh-internet-angel-desktop'
```

After installation, restart DSH Web and select this skin under **Settings → Skin Management**. If several skins are enabled at once,
the manager may first return to the official default interface; simply select one skin manually. This repository and the recommended skin manager are both public, so you can use the GitHub installation commands above directly.

**This is a UI skin for DSH Web, not a standalone game.** See [skin.json](skin.json) for the host compatibility declaration;
it is not a blanket compatibility guarantee for other versions, all devices, or third-party plugins.

The current adaptation targets DSH `0.2.0-rc.2`. Desktop and Start offer a Plugin Manager window
with native plugin lists, details, and configuration. It supports dragging and resizing; minimizing or closing
returns to chat, and restoring its task opens the plugin list. Control Panel follows the settings portal and
scrolls horizontally at narrow widths. Navigation, dragging, window states, form editing, and chat draft
retention were verified. Plugin installation, toggles, saving configuration, and IME composition were not tested.

Control Panel, Plugin Manager and native tools share pixel controls. Browser (Desktop and Start) and
Terminal (quick launch, next to Task Manager) open as floating windows in the desktop's window frame
without expanding the right sidebar, with taskbar refocusing. Stream opens the official channel in the
browser, and the magnifier in JINE's title bar opens a separate chat search window. My Computer is an
XP-style explorer over the current session's workspace that hands files to the host preview, with
My Pictures collecting images from JINE. Tools follow the selected session and unavailable host
components are disabled; DSH disables Browser by default in Web profiles, where Stream opens a new tab.

## Feedback scope

**This project does not accept reports about compatibility with any third-party plugins.**
Most plugins need individual adaptation for this simulated desktop. Their entry points, pop-ups, and layouts cannot simply reuse those of the official interface.
Missing plugin entry points, hidden plugin windows, and display issues caused by combining this skin with other plugins are outside this project's support scope.
The skin manager recommended above serves a specific integration purpose; recommending it does not imply general plugin compatibility support.

Reports about the skin itself are welcome. You can ask your Agent to investigate and organize the findings, then authorize it to
[submit an issue](https://github.com/Small-tailqwq/dsh-internet-angel-desktop/issues/new/choose).
Follow the issue template and include your DSH and skin versions, operating system, browser, zoom level, reproduction steps, expected and actual results,
and screenshots or error logs with sensitive information removed. Where possible, confirm that the issue still occurs with other non-essential plugins disabled, and search existing issues first.
Do not upload access tokens, secret keys, complete chat histories, or logs containing personal directory paths.

## Development

```powershell
pnpm install
pnpm typecheck
pnpm build
pnpm build:manifest
```

Source code is in `src/`; installation artifacts are in `lib/`. Original assets live in `assets/source/` and are registered in `assets/art.manifest.json`; `pnpm build` first copies them by content hash into `assets/runtime/`, which the skin's node half serves instead of inlining them into JavaScript. Keep build artifacts, runtime assets and the build fingerprint in sync after changes.
Tests are in `tests/`; builds and unit tests do not replace visual and interaction checks on real devices.
Reproducible bug reports and narrowly scoped improvements to the skin itself are welcome.

## Copyright and assets

This project is not a web port of the original game, nor is it officially authorized, sponsored, or endorsed by the original game's rights holders, DSH, or the relevant development teams or publishers.
The project maintainers maintain only the skin implementation and do not own the rights to the third-party game, font, or client assets included in it.

This repository currently grants no general open-source license. **Being able to view the source code does not grant permission to redistribute assets or use them commercially.**
A non-commercial-use statement is not a substitute for permission from the rights holders. For full asset attribution, source categories, and matters awaiting confirmation, see the
[asset attribution report](assets/ATTRIBUTION.md) and [copyright notice](NOTICE.md). Rights holders can contact the maintainers through an issue regarding the relevant assets.

## Thanks

Thanks to `amechanll` from a certain mysterious forum, and to all the brothers and sisters who have shared their valuable feedback and creative ideas. Thank you for helping make this desktop more fun.
