# Repository guidance

<!-- dsh-agent-scaffold:v1 -->

本仓库是 Internet Angel Desktop 皮肤的独立源码与发布仓库。脚手架、Agent Notes 和 DSH 宿主
差异卡由 `Small-tailqwq/dsh-skin-template` 维护；两边提交不得混合。

## 开发与推送

- 本仓库是皮肤源码与 GitHub 发布的唯一入口；脚手架中忽略的同名目录仅作临时预览，不作为提交源。
- 当前主线从 `0098b91` 干净快照开始。旧历史只在仓库外的私有备份中，不把备份历史合并回主线。
- 开工先检查工作树并 `git fetch origin`；干净工作树可 `git pull --ff-only`。已有用户修改时先保留，
  不用 reset --hard 或强推解决分歧。从当前 main 开分支，按正常提交和 fast-forward/PR 流程合入。
- 发布前执行已有 build；源码提交后运行 `pnpm build:manifest` 并提交指纹。用户授权发布时使用
  `git push origin main`，无需强推；推送前确认 `origin/main` 是待推送 HEAD 的祖先。
- `research/`、素材提取脚本与本机知识桥保留在本地并由 .gitignore 排除，不强制加入暂存区。

## 变更边界

- 皮肤只接管展示，不改变 DSH 服务、事件或模型请求；保留宿主控件、焦点、输入、portal 与热切换。
- 每次激活拥有自己的 DOM/CSS mutation、observer、listener、timer、RAF、节点与属性租约；
  `apply()` 部分失败、dispose、重复激活和热切换都要对称回收，只恢复本次激活实际修改的值。
- 不移动 React/Markdown renderer 拥有的节点；原位增强。皮肤自有预览可 clone，但不回写宿主树。
- `src/` 或素材变化后运行已有 build；提交型 `lib/` 与 `skin.build.json` 必须同步，fingerprint 不手改。
- 保护 NOTICE/ATTRIBUTION、素材来源与非商业许可链；bundle 不引入本机绝对路径或运行时远程素材。
- `skin.json.dshCompatibility` 只记录明确验证且 schema 可表达的 DSH 版本。普通 bug fix 不顺手抬版本。

## 冷验证

- 可运行 `pnpm typecheck`、`pnpm test`、`pnpm build` 与针对产物的静态检查。
- 浏览器、GUI、真实 profile、视觉/交互和 E2E 默认不运行；需要时先完成安全代码工作并另获授权。
- 冷测试通过不等于视觉、IME、拖拽、portal、真实热切换或 served bundle 已验证。

## Shared Agent Knowledge

- `.agents/dsh-scaffold.json` 是本机可选的 consumer/bridge 清单，不随皮肤发布。本机从脚手架运行
  `pnpm agents:bridge -- connect --repo <本仓库>`；用 `doctor` 检查链接。禁止链接整个
  `.agents/skills`，只连接清单列出的通用能力。
- 已接入本机知识桥时，开始非平凡诊断前，先在 `.agents/notes/INDEX.md` 按中文症状、英文技术词、scope 与 contract key
  渐进检索，只读命中的少量 note。宿主升级调用 `dsh-skin-upgrade`：先冻结本皮肤依赖 key，再查询并
  核验 `.agents/knowledge/dsh-host-deltas/`；不能继承另一皮肤的“已适配”结论。
- 每次非平凡修复、结构/流程变更或宿主升级收尾，必须调用 `dsh-note-maintainer` 并明确输出
  `Agent Notes: 增 / 改 / 不记 / deferred`。
- 共享 Junction/symlink 可读不代表中央目录可写。不可写、bridge 缺失或中央目标冲突时，把完整
  proposal 写入被忽略的 `.agents/bridge-state/` 并报告 deferred；不要静默漏记，不自动 pull、
  commit 或 push。
- 皮肤源码、`lib` 与构建指纹只在本仓库提交；Note/Card 只在脚手架提交，用 Related/commit SHA 互链。

本机知识桥未安装时，读取仓库源码与文档继续工作；不要为缺失的私有目录阻断普通开发。

## 目录

- `src/`：皮肤源码；`src/client/` 是浏览器半边。
- `build/`、`tsdown.config.ts`：client bundler 与平台契约。
- `assets/`、`preview/`：素材、署名与预览。
- `lib/`、`skin.build.json`：提交型发布产物。
- `tests/`：行为夹具，不替代真实宿主验收。
