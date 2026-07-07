# 04_Architecture - 技术架构方案

## 1. 背景与目标

项目是纯前端单机 Web 小游戏：炫酷的肉鸽俄罗斯方块。MVP 目标不是一次性做完整 18 阶段，而是先跑通前约 1-2 章 / 6-8 阶段，验证“核心方块玩法 + 最小肉鸽循环 + 视觉/音效反馈”。架构需要支持后续扩展到完整 18 阶段、Boss、词缀、更多强化与 BGM，但首版不引入后端、账号、联机、排行榜或复杂构建链。

架构原则：
- 先跑通再优化，优先选择开发可执行、QA 可验证的方案。
- 游戏规则与渲染分离，核心逻辑可用单元测试验证。
- 肉鸽内容数据化，避免每个强化都变成散落的特殊判断。
- 静态托管可部署，GitHub Pages / 任意 CDN 均可承载。

## 2. 技术选型

### 2.1 候选方案对比

| 方案 | 优点 | 缺点 | 结论 |
|---|---|---|---|
| 纯 Canvas + TypeScript | 包体最小、完全可控、规则层最干净 | 输入、音频、粒子、相机震动、场景管理都要自建；“炫酷”反馈成本高 | 不选。适合极简 Tetris，不适合本项目表现目标 |
| PixiJS + TypeScript | 2D 渲染强、粒子与滤镜灵活、性能好 | 游戏循环、输入、音频、场景、资源生命周期需要自行组织 | 备选。若团队已有 Pixi 经验可用，但工程胶水更多 |
| Phaser 3 + TypeScript | 内置场景、主循环、输入、音频、粒子、摄像机震动、资源加载；Web 小游戏成熟 | 包体略高，需避免把规则逻辑写死在 Scene 中 | 选用。最符合 MVP 速度与炫酷反馈需求 |

### 2.2 最终技术栈

- 语言：TypeScript。
- 构建：Vite。
- 游戏引擎：Phaser 3。
- 测试：Vitest，用于核心规则、SRS、随机、强化效果与数值配置测试。
- 代码质量：ESLint + Prettier。
- 存档：localStorage，封装版本号与迁移入口。
- 部署：静态资源部署到 GitHub Pages 或其他静态托管。

### 2.3 选型理由

Phaser 3 覆盖本项目最耗时的外壳能力：场景切换、资源加载、键盘输入、音频播放、粒子、Tween、摄像机震动和固定步进更新。这样开发工程师能把主要精力放在方块规则、肉鸽系统与调参上。

核心玩法不依赖 Phaser 数据结构。棋盘、方块、SRS、随机袋、消行、得分、强化效果全部放在 TypeScript 纯逻辑模块中；Phaser 只负责显示状态和收集输入。这样可以降低后续维护风险，也便于 QA 用脚本复现输入序列。

## 3. 目标工程目录

```text
.
├── docs/
│   ├── 02_PRD.md
│   ├── 03_GameDesign.md
│   ├── 03_Balance.md
│   └── 04_Architecture.md
├── public/
│   └── assets/
│       ├── audio/
│       ├── fonts/
│       ├── images/
│       └── particles/
├── src/
│   ├── main.ts
│   ├── app/
│   │   ├── GameApp.ts
│   │   └── phaserConfig.ts
│   ├── scenes/
│   │   ├── BootScene.ts
│   │   ├── PreloadScene.ts
│   │   ├── TitleScene.ts
│   │   ├── GameScene.ts
│   │   ├── RewardScene.ts
│   │   ├── PauseScene.ts
│   │   └── GameOverScene.ts
│   ├── core/
│   │   ├── board.ts
│   │   ├── piece.ts
│   │   ├── tetrominoes.ts
│   │   ├── srs.ts
│   │   ├── bag.ts
│   │   ├── gravity.ts
│   │   ├── scoring.ts
│   │   ├── lockDelay.ts
│   │   └── gameState.ts
│   ├── rogue/
│   │   ├── stageSystem.ts
│   │   ├── upgradeSystem.ts
│   │   ├── upgradeEffects.ts
│   │   ├── skillSystem.ts
│   │   ├── affixSystem.ts
│   │   ├── rewardPool.ts
│   │   └── eventBus.ts
│   ├── render/
│   │   ├── boardRenderer.ts
│   │   ├── pieceRenderer.ts
│   │   ├── hudRenderer.ts
│   │   ├── effects.ts
│   │   ├── cameraFx.ts
│   │   └── responsiveLayout.ts
│   ├── input/
│   │   ├── inputManager.ts
│   │   ├── keyboardBindings.ts
│   │   └── touchControls.ts
│   ├── audio/
│   │   ├── audioManager.ts
│   │   └── soundIds.ts
│   ├── storage/
│   │   ├── saveService.ts
│   │   └── saveSchema.ts
│   ├── data/
│   │   ├── stages.ts
│   │   ├── balance.ts
│   │   ├── upgrades.ts
│   │   ├── skills.ts
│   │   └── affixes.ts
│   ├── ui/
│   │   ├── rewardCards.ts
│   │   ├── pauseMenu.ts
│   │   └── gameOverPanel.ts
│   └── types/
│       └── game.ts
└── tests/
    ├── core/
    ├── rogue/
    └── fixtures/
```

阶段1若已有占位骨架，建议保留入口与基础构建，只按上面结构补齐 `src/` 和 `docs/`；不要为了目录美观重写已有脚手架。

## 4. 核心系统方案

### 4.1 游戏循环

使用 Phaser 的 `Scene.update(time, delta)` 作为外部驱动，但内部采用固定步进累积器：
- 渲染每帧执行。
- 逻辑以固定 tick 推进，例如 60 tick/s。
- 重力下落、锁定延迟、技能冷却、阶段计时都使用逻辑时间，避免低帧率导致规则漂移。

`GameScene` 只负责：
- 读取输入并转换为命令。
- 调用 `GameState.step(command, dt)`。
- 将新的状态交给 Renderer。
- 接收核心逻辑发出的事件并播放特效、音效或切换场景。

### 4.2 方块核心逻辑

棋盘采用 10x20 可见行 + 2 行隐藏生成区。内部数据结构建议使用一维数组：

```text
cells[y * width + x]
```

每个 cell 记录：
- `kind`: empty / normal / garbage / locked / cracked / bomb / ghost。
- `color` 或 `pieceType`。
- `durability`，用于锁定块、裂纹块等。
- `flags`，用于临时效果。

核心模块职责：
- `board.ts`：碰撞、落位、消行、垃圾行生成、特殊格处理。
- `piece.ts`：当前方块、旋转态、坐标、ghost 位置。
- `tetrominoes.ts`：7 种 Tetromino 形状定义。
- `srs.ts`：标准 SRS 旋转与踢墙表。
- `bag.ts`：7-bag 随机，支持强化改写袋生成。
- `gravity.ts`：重力等级到下落间隔的映射。
- `lockDelay.ts`：触底后的锁定延迟、移动/旋转重置规则。
- `scoring.ts`：消行、Combo、Tetris、后续 T-Spin 扩展入口。

MVP 必须实现标准 SRS 含踢墙。完整 T-Spin 判定按 Leader 裁决延后，因此 SRS 先只服务旋转手感；T-Spin 相关奖励与强化在配置中禁用。

### 4.3 输入系统

输入统一转换为命令，不让业务直接读键盘状态：

```text
MoveLeft
MoveRight
SoftDropStart
SoftDropEnd
HardDrop
RotateCW
RotateCCW
Hold
Pause
CastSkill1
CastSkill2
CastSkill3
```

桌面键盘是 MVP 主目标。触屏控制放 P1，但接口提前保留，让 `touchControls.ts` 也输出同一套命令。键位配置未来可进入 `storage`。

### 4.4 肉鸽系统

肉鸽系统采用事件总线 + 效果注册表：

```text
onRunStart
onStageStart
onPieceSpawn
onPieceLock
onLineClear
onComboChange
onHardDrop
onEnergyChanged
onSkillCast
onStageComplete
onRunEnd
```

强化由数据和效果函数共同描述：
- 数据：ID、名称、稀有度、标签、描述、参数、互斥关系、MVP 开关。
- 效果：监听事件或修改规则参数。

示例：
- `precision_hard_drop`：监听 `onHardDrop`，提高硬降能量收益。
- `stable_preview`：修改 `previewCount`。
- `tetris_charge`：监听四行消除，增加能量。
- `line_clearer`：主动技能，消耗能量清除最低一行。

MVP 内容建议：
- 强化 20-30 个，其中 P0 最少 10 个。
- 主动技能 2-4 个。
- 阶段词缀先做 4 个：加速风暴、迷雾预览、堵塞底层、Hold 干扰。
- 阶段先实现 6-8 个，数据结构兼容 18 阶段。

### 4.5 阶段与奖励

`stageSystem.ts` 管理：
- 当前阶段编号、类型、目标、重力等级、垃圾行、词缀。
- 阶段完成判断。
- 奖励触发与下一阶段推进。

奖励三选一由 `rewardPool.ts` 根据稀有度权重、流派标签、已拥有强化、互斥规则生成。要求：
- 三个选项不重复。
- 已禁用系统（例如 T-Spin）不进入池。
- 选择奖励时暂停主游戏逻辑。

### 4.6 存档

MVP 只存本地最高分和基础设置：

```json
{
  "version": 1,
  "highScore": 0,
  "bestStage": 0,
  "settings": {
    "masterVolume": 1,
    "sfxVolume": 1,
    "musicVolume": 0.7,
    "reducedMotion": false
  }
}
```

使用 `localStorage`，封装在 `saveService.ts`。不直接在 UI 或 Scene 中读写 localStorage，避免后续迁移困难。

### 4.7 音频

Leader 已裁决：MVP 音效进 P0，BGM 留 P1。音频系统需要从一开始预留 BGM 通道。

`audioManager.ts` 提供：
- `playSfx(id, options)`。
- `playMusic(id)`。
- `stopMusic()`。
- `setBusVolume(master/sfx/music, value)`。
- `mute()` / `unmute()`。

MVP 最小音效：
- 消行。
- 强化选择。
- 硬降。
- Game Over。

BGM 资源与动态混音可后置，但接口不可后补到业务逻辑里。

### 4.8 特效与视觉

Phaser 负责粒子、Tween、摄像机震动、闪光与 HUD 动画。渲染层只消费核心事件：
- 单行/双行/三行/Tetris 使用不同粒子数量、闪光强度与震动幅度。
- 强化选择播放卡片入场和确认效果。
- 阶段切换播放短提示和棋盘边框脉冲。
- 特殊块有独立材质或 tint，不靠纯文字识别。

必须提供 `reducedMotion` 入口：
- 降低粒子数量。
- 关闭或减弱屏幕震动。
- 禁用高频闪烁。

## 5. 数据配置策略

阶段、数值、强化、技能、词缀都放在 `src/data/`。早期可用 TypeScript 对象，便于类型检查；若后续需要策划直接编辑，可迁移为 JSON。

配置必须满足：
- 每个强化有唯一 ID。
- 每个效果有明确参数，不写魔法数字在逻辑中。
- MVP 禁用项通过配置过滤，不删除结构。
- 数值表与 `03_Balance.md` 保持字段一致。

建议字段：

```ts
type UpgradeConfig = {
  id: string;
  name: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  tags: string[];
  effect: string;
  params: Record<string, number | string | boolean>;
  enabledInMvp: boolean;
};
```

## 6. 测试策略

MVP 至少覆盖以下自动化测试：
- 7 种方块的 4 个旋转态。
- SRS 踢墙表关键场景，尤其 I、T、边墙、堆叠边界。
- 7-bag 随机：每袋恰好包含 7 种方块。
- Hold：同一方块不可连续 Hold 两次。
- 消行与计分：单/双/三/Tetris、Combo。
- Top-out 死亡判定。
- 强化效果：至少覆盖 P0 强化池全部效果。
- 阶段推进：目标完成后触发奖励，奖励选择后进入下一阶段。
- 存档：最高分写入、读取、版本迁移默认值。

渲染与特效以手动 QA 为主，不在 MVP 引入重量级端到端测试。

## 7. 性能策略

目标：
- 桌面 Chrome / Edge / Firefox / Safari 近两年版本：60 FPS，10 分钟平均不低于 58 FPS。
- 移动端 P1：不低于 30 FPS。
- 首屏 gzip 后资源小于 5 MB。
- 单局内存低于 150 MB。
- 连续 30 分钟内存增长低于 10%。

优化手段：
- 棋盘格对象池化，避免每次消行创建大量 DisplayObject。
- 粒子使用上限与对象池，按特效等级缩放数量。
- 棋盘渲染按格子复用 Sprite 或 Graphics 批量绘制，不为每个临时状态反复 new。
- 资源按场景预加载，MVP 不加载未使用 BGM 和高分辨率冗余素材。
- 逻辑 tick 与渲染解耦，低帧率时限制单帧补偿步数，避免死亡螺旋。
- 配置 `reducedMotion`，也作为低端设备降级选项。

## 8. 部署方案

项目为纯静态站点：
- `npm run build` 产出 `dist/`。
- GitHub Pages 可直接部署 `dist/`。
- 若使用 GitHub Actions，流程为安装依赖、运行 lint/test/build、上传 Pages artifact。

Vite 配置需要支持子路径部署：
- GitHub Pages 项目页使用 `base: '/repo-name/'`。
- 自定义域名或根路径部署使用 `base: '/'`。

运行时不依赖环境变量、不需要服务端 API、不需要数据库。所有游戏内容随静态包发布，本地存档保存在浏览器。

## 9. 风险与取舍

### 风险 1：SRS、锁定延迟和方块规则容易出现隐性手感问题

取舍：不用 Phaser 物理系统处理方块规则，全部使用纯逻辑网格。用 Vitest 覆盖 SRS、碰撞、锁定、消行。这样初期代码多一些，但可测、可复现，避免后期调手感靠猜。

### 风险 2：炫酷特效可能拖累性能或影响可读性

取舍：特效系统事件化、分层控制。MVP 做粒子、闪光、震屏、HUD 动画，但每类都有强度参数和 reducedMotion 开关。优先保证棋盘清晰和输入响应。

### 风险 3：肉鸽强化组合会导致状态爆炸

取舍：强化只通过事件和参数改写规则，不允许随意改内部私有状态。MVP 禁用完整 T-Spin 和过复杂事件房，先实现前 6-8 阶段；18 阶段作为数据扩展目标，而不是首版硬交付。

### 风险 4：Phaser 让 Scene 变成大泥球

取舍：Scene 不承载核心规则。所有规则在 `core` / `rogue`，Scene 只调度输入、渲染和场景切换。开发评审时重点检查是否把业务逻辑写进 `GameScene`。

## 10. 下游执行建议

开发阶段建议顺序：
1. 建立 Vite + TS + Phaser 3 工程和目录骨架。
2. 实现 `core`：棋盘、方块、SRS、7-bag、消行、计分、死亡。
3. 接入 `GameScene` 和基础渲染，跑通可玩的纯 Tetris。
4. 实现 Hold、Next、暂停、Game Over、重开。
5. 接入能量、奖励三选一、P0 强化池。
6. 接入阶段系统、前 6-8 阶段数据、4 个词缀。
7. 接入 P0 音效、粒子、震屏、最高分存档。
8. 补齐测试、性能检查和静态部署配置。

发布阶段只需要静态托管能力；仓库绑定后优先补齐 `docs/02_PRD.md`、`docs/03_GameDesign.md`、`docs/03_Balance.md`、`docs/04_Architecture.md`，再进入开发实现。
