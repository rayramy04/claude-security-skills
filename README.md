# claude-security-skills

Claude Code 用セキュリティスキル3種と、それを評価するテストハーネスのセットです。

## スキルの住み分け

| タイミング | スキル | 対象 |
|-----------|--------|------|
| PR 作成時 | `/security-review` | git diff のみ・静的解析 |
| リリース前 | `/full-scan` | 全ソースファイル + 依存関係 CVE |
| デプロイ後 | `/security-scan` | ランタイム挙動・HTTP 動的テスト |

3スキルを組み合わせることで、開発サイクル全体をカバーします。

## インストール

```bash
cp commands/*.md ~/.claude/commands/
```

Claude Code を再起動すると `/security-review`、`/full-scan`、`/security-scan` が使えるようになります。

詳細な設定手順は [templates/security-skills-setup.md](templates/security-skills-setup.md) を参照してください。

## スキル概要

### `/security-review` — 差分ベース静的解析

PR・ブランチの `git diff` を対象に、変更されたコードのみをセキュリティ解析します。

**検出対象:**
- インジェクション（SQL / NoSQL / コマンド / テンプレート）
- 認証・認可の欠陥（JWT 誤実装・認可バイパス）
- ハードコードされた認証情報・API キー
- 危険なメソッドによる XSS（`dangerouslySetInnerHTML` 等）
- PII・トークンのログ出力

**特徴:** 偽陽性フィルタリング（信頼度 0.8 以上のみ報告）、既存のセキュリティパターンとの比較分析

---

### `/full-scan` — 全ファイル静的解析（言語・フレームワーク非依存）

プロジェクト構造を自動検出し、全ソースファイルの静的解析と依存関係 CVE スキャンを並列実行します。

**特徴:**
- モノレポ対応（モジュールごとにサブエージェントを並列実行）
- `npm audit` / `pip-audit` / `cargo audit` 等の依存関係スキャン
- `gitleaks` によるシークレット漏洩チェック
- コンテキスト上限到達時は PARTIAL SCAN として明示

---

### `/security-scan` — ランタイム検証

ステージング環境にデプロイ済みのサーバーに対して HTTP 動的テストを実行します。

**検証内容:**
- HTTP セキュリティヘッダー（HSTS・CSP・X-Frame-Options 等）
- OWASP Top 10（A01〜A10）
- JWT アルゴリズム混乱攻撃・Cookie 属性
- SQL / NoSQL / コマンドインジェクション
- プロンプトインジェクション（AI 機能がある場合）

**前提:** `security-agent.config.yml` と `STAGING_URL` 環境変数が必要

---

## カバレッジ

### 3スキル合算

| 領域 | カバレッジ |
|------|----------|
| OWASP Top 10 ベース | 約 65〜70% |
| コードパターン系（injection, XSS, hardcoded key） | 約 90% |
| 依存関係 CVE | 約 85% |
| HTTP 設定ミス | 約 75% |
| ビジネスロジック・インフラ設定 | ペネトレーションテスト（人手）が必要 |

### 各スキルがカバーできない領域

| 領域 | 推奨手段 |
|------|---------|
| 変更差分以外の既存コードの脆弱性 | `/full-scan` |
| 依存関係の既知 CVE | `/full-scan` |
| デプロイ後のランタイム挙動 | `/security-scan` |
| ビジネスロジックの欠陥 | ペネトレーションテスト |
| インフラ・クラウド設定（IAM 等） | インフラ担当者レビュー |
| ゼロデイ脆弱性 | CVE データベース外のため検出不可 |

---

## テストハーネス

`tests/security-skills/` にフィクスチャと採点基準（`expected.json`）が含まれます。

### フィクスチャの構成

| ディレクトリ | 内容 |
|------------|------|
| `fixtures/vuln/` | Easy: 基本的な脆弱性パターン |
| `fixtures/safe/` | Easy: 安全なパターン（偽陽性テスト） |
| `fixtures/hard-vuln/` | Hard: 一見安全に見える脆弱性 |
| `fixtures/hard-safe/` | Hard: 一見危険に見える安全なパターン |
| `fixtures/attacker/` | Attacker: 実攻撃者レベルのパターン |
| `fixtures/attacker-safe/` | Attacker: 難しい安全パターン |
| `fixtures/no-comment-vuln/` | No-Comment: コメントなし脆弱コード |
| `fixtures/no-comment-safe/` | No-Comment: コメントなし安全コード |
| `fixtures/deep-chain/` | 6ファイル深連鎖（JWT 署名検証なし） |
| `fixtures/framework-bypass/` | Next.js middleware + rewrite バイパス |
| `fixtures/infra-combo/` | CSP 設定 + XSS 組み合わせ |

### 実測スコア（`/full-scan` による評価）

| 難易度 | Recall | FP Rate |
|--------|--------|---------|
| Easy | 100% | 0% |
| Hard | 100% | 0% |
| Attacker-level | 100% | 0% |
| No-Comment | 100% | 0% |
| 深連鎖（6ファイル） | 100% | 0% |
| フレームワーク挙動依存 | 100% | 0% |
| インフラ設定組み合わせ | 100% | 0% |

### テストの実行方法

Claude Code で以下を実行します：

```
/full-scan tests/security-skills/fixtures
```

`expected.json` の採点基準と照合して、検出漏れ・偽陽性を確認してください。

---

## ファイル構成

```
claude-security-skills/
├── commands/
│   ├── security-review.md        # /security-review スキル本体
│   ├── full-scan.md              # /full-scan スキル本体
│   └── security-scan.md         # /security-scan スキル本体
├── templates/
│   ├── security-agent.config.template.yml  # /security-scan 設定テンプレート
│   └── security-skills-setup.md           # 新プロジェクト導入手順
└── tests/
    └── security-skills/
        ├── expected.json          # 採点基準（模範解答）
        └── fixtures/              # テスト用コードフィクスチャ
```

## ライセンス

MIT
