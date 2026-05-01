# 新プロジェクト導入手順

## 1. スキルファイルをインストール

```bash
cp commands/*.md ~/.claude/commands/
```

Claude Code を再起動すると `/security-review`、`/full-scan`、`/security-scan` が使えるようになります。

## 2. `/security-scan` の設定（ランタイム検証を使う場合）

`security-agent.config.template.yml` をプロジェクトルートにコピーして編集します。

```bash
cp templates/security-agent.config.template.yml ./security-agent.config.yml
```

編集ポイント：

| フィールド | 説明 |
|-----------|------|
| `target.base_url` | ステージング環境の URL。環境変数 `STAGING_URL` で上書き可 |
| `scope.include` | スキャン対象エンドポイント |
| `scope.exclude` | スキップするエンドポイント（バイナリ応答等） |
| `agents` | 有効にするテストエージェント |
| `severity_gate` | CI 判定の閾値（`high` 推奨） |

## 3. `.gitignore` にスキャン結果を追加

スキャン結果ファイルには実際のエンドポイント情報・脆弱性内容が含まれるため、リポジトリにコミットしないことを推奨します。

```gitignore
security-reports/
security-report.md
coverage-report.yml
security-agent.config.yml  # プロジェクト固有エンドポイントを含む場合
```

## 4. 使用例

```bash
# PR 作成前: 変更差分のみをチェック
/security-review

# リリース前: 全ファイル + 依存関係をスキャン
/full-scan

# ステージングデプロイ後: ランタイム検証
STAGING_URL=https://staging.example.com /security-scan
```

## スキルの住み分け

| タイミング | スキル | 対象 |
|-----------|--------|------|
| PR 作成時 | `/security-review` | git diff のみ・静的解析 |
| リリース前 | `/full-scan` | 全ソースファイル + 依存関係 CVE |
| デプロイ後 | `/security-scan` | ランタイム挙動・HTTP 動的テスト |
