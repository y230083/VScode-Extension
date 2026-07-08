# Passive Coding Coach

Passive Coding Coach は、VS Code上でプログラミング学習を支援するための拡張機能です。

コーディング中に一定時間編集が停止し、エラーが存在する場合に、
LLM（OpenAI API）を利用して学習者が自力で問題を解決できるようなヒントを提示します。

---

## 主な機能

- 編集停止（アイドル状態）の検知
- VS Code Diagnostics によるエラー取得
- OpenAI API を利用したヒント生成
- コード周辺のみを送信して効率的に推論
- ヒントのキャッシュ機能
- Output Channelへのヒント表示

---

## システム構成

```
VS Code
    │
    ▼
Monitor
    │
    ├── Idle Detector
    ├── Diagnostics
    └── Code Context
          │
          ▼
Notification
          │
          ▼
LLM
    ├── Prompt Builder
    ├── Cache
    └── OpenAI API
```

---

## ディレクトリ構成

```text
src
│
├── extension.ts
│
├── monitor
│   ├── monitor.ts
│   ├── idleDetector.ts
│   ├── diagnostics.ts
│   └── codeContext.ts
│
├── llm
│   ├── llm.ts
│   ├── prompt.ts
│   └── cache.ts
│
├── ui
│   └── notification.ts
│
└── config
    └── config.ts
```

---

## インストール

```bash
git clone <repository-url>

cd passive-coding-coach

npm install
```

---

## OpenAI API の設定

プロジェクト直下に `.env` を作成します。

```env
OPENAI_API_KEY=your_api_key
```

`.env` は GitHub にアップロードしないでください。

---

## 実行方法

```bash
npm run compile
```

その後、

- VS Codeでプロジェクトを開く
- `F5` を押す
- Extension Development Host が起動します

---

## 開発環境

- Visual Studio Code
- TypeScript
- Node.js
- OpenAI API
- VS Code Extension API

---

## 今後の予定

- 通知タイミングの改善
- エラーが無い場合の行き詰まり検知
- VS Code設定画面の追加
- 学習履歴の保存
- 通知評価機能

---

## ライセンス

MIT License