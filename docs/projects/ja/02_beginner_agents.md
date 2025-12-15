# モジュール 02: 初級エージェント - 初めての LLM エージェント

**対象読者:** ペルソナ 1 (初級者)

**前提条件:**

- [モジュール 01: 環境セットアップ](./01_setup.md) を完了していること
- TypeScript/JavaScript の基本的な理解
- テキストエディタとコマンドラインの使用経験
- `pnpm` がインストールされていること (未インストールの場合):
  - `npm install -g pnpm` または `corepack enable pnpm`

このモジュールでは、既存のエージェントを変更することで、LLM アプリケーション開発の基礎を学びます。プロンプトエンジニアリング、ロジックの変更、そしてカスタムツールや構造化出力といった高度な機能を通じて、エージェントの振る舞いをカスタマイズする方法を習得します。

## 学習目標

このモジュールを完了すると、以下のことができるようになります:

1. システム指示（System Instructions）が LLM の振る舞いをどのように制御するか理解する
2. エージェントの性格や応答スタイルを変更する
3. 特定のユースケースに合わせてエージェントのロジックをカスタマイズする
4. エージェントにカスタムツール（関数呼び出し）を実装する
5. エージェントに構造化データ（JSON）を返させる
6. `createAgent` を使用して ReAct エージェントを構築する
7. Web インターフェースを通じて変更をテストする

## モジュール 1: エージェントのペルソナをカスタマイズする

### コンセプト: システム指示と役割

**システム指示 (System Instructions)** は、LLM にどのように振る舞うべきかを伝える特別なプロンプトです。エージェントの性格、口調、能力を設定します。AI アシスタントの「職務記述書」のようなものと考えてください。

このコードベースでは、システム指示は各エージェントのノードファイル内の `callModel` 関数で定義されています。

### ハンズオン演習: Default Agent を海賊に変身させる

Default Agent を海賊のように応答するように変更してみましょう！

1. **Default Agent のノードファイルを開く**:

   ```bash
   code packages/agents/src/agents/default_agent/defaultAgentNodes.ts
   ```

   または、お好みのエディタで開いてください:

   ```text
   packages/agents/src/agents/default_agent/defaultAgentNodes.ts
   ```

2. **`callModel` 関数を探す** (12-74行目付近)

3. **`systemInstruction` を見つける** (43-44行目付近):

   ```typescript
   systemInstruction:
     "You are a helpful AI assistant. You are knowledgeable, friendly, and always try to provide accurate and useful information. When users ask questions, respond in a clear, helpful manner.",
   ```

4. **海賊のペルソナに置き換える**:

   ```typescript
   systemInstruction:
     "You are a friendly pirate AI assistant. You speak like a pirate from the golden age of piracy, using phrases like 'Ahoy!', 'Arr!', 'Shiver me timbers!', and 'Yo ho ho!'. You are knowledgeable and helpful, but always maintain your pirate persona. When users ask questions, respond in character as a pirate while still providing accurate and useful information.",
   ```

5. **ファイルを保存する**

6. **agents パッケージを再ビルドする**:

   ```bash
   cd packages/agents
   pnpm build
   ```

   またはルートディレクトリから:

   ```bash
   pnpm build
   ```

7. **バックエンドを再起動する** (実行中の場合):
   - バックエンドサーバーを停止 (Ctrl+C)
   - 再起動: `cd packages/backend && pnpm dev`

8. **変更をテストする**:
   - ブラウザで `http://localhost:4200` を開く
   - ドロップダウンから "Default Agent" を選択
   - メッセージを送信: "Hello, how are you?" (こんにちは、元気ですか？)
   - 海賊口調で応答が返ってくるはずです！

### 演習: 異なるペルソナを試す

仕組みがわかったところで、異なるペルソナを作成してみましょう:

- **技術エキスパート**: シニアソフトウェアエンジニアのように応答するようにシステム指示を変更してください。専門用語を使用し、ベストプラクティスに重点を置くようにします。

- **詩人**: 常に詩で応答し、最後に短い詩で締めくくるようにエージェントを変更してください。

- **オリジナルの作成**: あなた独自のユニークなペルソナを考えてみましょう！

**チャレンジ**: ユーザーのメッセージに含まれるキーワードに基づいて、エージェントがペルソナを切り替えるようにできますか？（ヒント: `systemInstruction` が設定される前のロジックを変更する必要があります）

## モジュール 2: リサーチロジックの強化

### コンセプト: ツールの使用と計画

Research Agent は **マルチステップワークフロー** を使用します:

1. **クエリの計画 (Plan Queries)**: ユーザーの質問に基づいて検索クエリを生成する
2. **検索の実行 (Execute Searches)**: Google Search Tool を使用してクエリを実行する
3. **結果の統合 (Synthesize Results)**: 検索結果を包括的な回答にまとめる

これは LLM アプリケーションにおける一般的なパターンです。複雑なタスクを小さなステップに分割し、実行してから結果を統合します。

### ハンズオン演習: 最小検索クエリ数を強制する

現在、Research Agent は検索クエリを 1〜2 個しか生成しない場合があります。より広範囲をカバーするために、常に少なくとも 3 つのクエリを生成するように変更しましょう。

1. **Research Agent のノードファイルを開く**:

   ```bash
   code packages/agents/src/agents/research_agent/researchAgentNodes.ts
   ```

   または開く:

   ```text
   packages/agents/src/agents/research_agent/researchAgentNodes.ts
   ```

2. **`planQueries` 関数を探す** (51-94行目付近)

3. **プロンプトを見つける** (57行目付近):

   ```typescript
   const prompt = `Return the queries as a JSON array of strings under the key "queries".\nUser question: ${state.user_message}\nExample: { "queries": ["weather in Tokyo tomorrow", "weather in London tomorrow"] }`;
   ```

4. **最小クエリ数を強制するようにプロンプトを変更する**:

   ```typescript
   const prompt = `Return the queries as a JSON array of strings under the key "queries". You MUST generate at least 3 distinct search queries to ensure comprehensive coverage of the topic.\nUser question: ${state.user_message}\nExample: { "queries": ["weather in Tokyo tomorrow", "weather in London tomorrow", "weather forecast accuracy"] }`;
   ```

5. **パース後に検証ロジックを追加する** (74行目付近):

   ```typescript
   const queries = jsonString ? JSON.parse(jsonString).queries : [];

   // Ensure at least 3 queries
   if (queries.length < 3) {
     logger.warn(
       `Only ${queries.length} queries generated, expected at least 3. Adding default queries.`,
     );
     // Add generic queries if needed
     while (queries.length < 3) {
       queries.push(
         `${state.user_message} - perspective ${queries.length + 1}`,
       );
     }
   }
   ```

6. **ファイルを保存する**

7. **再ビルドと再起動** (モジュール 1 と同様の手順)

8. **変更をテストする**:
   - ドロップダウンから "Research Agent" を選択
   - 質問する: "What are the benefits of renewable energy?" (再生可能エネルギーの利点は何ですか？)
   - バックエンドのログを確認し、複数の検索クエリが実行されていることを確認してください

### 演習: クエリの質を向上させる

以下の機能強化を試してみてください:

- **クエリの多様性を追加**: 異なる側面（例：「利点」、「コスト」、「実装」）をカバーするようにプロンプトを変更する

- **クエリの検証を追加**: クエリが似すぎていないか確認し、重複をマージする

- **クエリの優先順位付けを追加**: 重要度や予想される関連性でクエリを並べ替える

## モジュール 3: カスタムツールの実装

### コンセプト: 関数呼び出し (Function Calling)

**関数呼び出し**（またはツール使用）により、LLM は外部のコードや API と対話できます。モデルは単にテキストを生成するだけでなく、定義された関数に対する構造化された呼び出しを生成できます。

`DefaultAgent` には `call_tool` ノードがありますが、非アクティブな場合があります。これを有効にして、カスタムツールを追加しましょう。

### ハンズオン演習: 電卓ツールの追加

1. **ツールの定義**: ツールのための新しいファイルを作成します。

   `packages/agents/src/tools/calculator.ts` を作成:

   ```typescript
   import { FunctionDeclaration, SchemaType } from "@google/genai";

   export const calculatorToolDeclaration: FunctionDeclaration = {
     name: "calculator",
     description:
       "Perform basic arithmetic operations (add, subtract, multiply, divide).",
     parameters: {
       type: SchemaType.OBJECT,
       properties: {
         operation: {
           type: SchemaType.STRING,
           description:
             "The operation to perform: 'add', 'subtract', 'multiply', 'divide'.",
         },
         a: {
           type: SchemaType.NUMBER,
           description: "The first number.",
         },
         b: {
           type: SchemaType.NUMBER,
           description: "The second number.",
         },
       },
       required: ["operation", "a", "b"],
     },
   };

   export function executeCalculator(
     operation: string,
     a: number,
     b: number,
   ): number {
     switch (operation) {
       case "add":
         return a + b;
       case "subtract":
         return a - b;
       case "multiply":
         return a * b;
       case "divide":
         return a / b;
       default:
         throw new Error("Unknown operation");
     }
   }
   ```

2. **Default Agent にツールを登録**:

   `packages/agents/src/agents/default_agent/defaultAgentNodes.ts` を開きます。

   ツールをインポート:

   ```typescript
   import {
     calculatorToolDeclaration,
     executeCalculator,
   } from "../../tools/calculator";
   ```

   `callModel` 内の `tools` 設定を更新:

   ```typescript
   tools: [{ functionDeclarations: [getCurrentTimeToolDeclaration, calculatorToolDeclaration] }],
   ```

3. **ツールの実行を処理**:

   `callTool`（またはツール実行を処理する関数）で、電卓を実行するロジックを追加します:

   ```typescript
   // ツール呼び出しを処理するループ内
   if (toolCall.name === "calculator") {
     const { operation, a, b } = toolCall.args;
     const result = executeCalculator(operation, a, b);
     // 結果をモデルに返す...
   }
   ```

4. **再ビルドと再起動**。

5. **テスト**: "What is 123 multiplied by 456?" (123 かける 456 は？) と尋ねてみてください。エージェントはツールを使用して正しい答えを出すはずです。

## モジュール 4: 構造化出力の操作

### コンセプト: 構造化出力 (JSON モード)

アプリケーションで処理するために、LLM に自由形式のテキストではなく、特定の形式（JSON など）でデータを出力させる必要がある場合があります。Gemini はこれを強制するための **レスポンススキーマ** をサポートしています。

### ハンズオン演習: ユーザー情報を JSON として抽出

Default Agent を変更（または一時的なテスト関数を作成）して、ユーザー情報を抽出してみましょう。

1. **Default Agent の `callModel` を変更**:

   `packages/agents/src/agents/default_agent/defaultAgentNodes.ts` にて。

   `SchemaType` をインポート:

   ```typescript
   import { SchemaType } from "@google/genai";
   ```

2. **設定を更新**:

   `responseMimeType` と `responseSchema` を変更します:

   ```typescript
   const result = await genAI.models.generateContent({
     model: modelName,
     contents,
     config: {
       responseMimeType: "application/json",
       responseSchema: {
         type: SchemaType.OBJECT,
         properties: {
           name: { type: SchemaType.STRING, description: "User's name" },
           intent: {
             type: SchemaType.STRING,
             description: "User's intent or goal",
           },
           sentiment: {
             type: SchemaType.STRING,
             description:
               "Sentiment of the message (positive, negative, neutral)",
           },
         },
         required: ["intent", "sentiment"],
       },
       systemInstruction:
         "You are an entity extractor. Analyze the user's message and extract the required fields in JSON.",
     },
   });
   ```

   _注: これは通常のチャット動作を置き換えます。これ用に別の「抽出エージェント」を作成するか、フラグで切り替えるようにすると良いでしょう。_

3. **再ビルドとテスト**:

   メッセージを送信: "I'm frustrated that my order hasn't arrived yet. My name is John." (注文がまだ届かなくてイライラしています。私の名前はジョンです。)

   以下のような JSON 文字列が返されるはずです:

   ```json
   {
     "name": "John",
     "intent": "check order status",
     "sentiment": "negative"
   }
   ```

## モジュール 5: エージェントの状態（State）を理解する

### コンセプト: LangGraph における状態管理

エージェントは **状態 (state)** を使用して、会話中の情報を追跡します。状態はノード間で渡され、エージェントがリクエストを処理するにつれて更新されます。

### Default Agent の状態を確認する

1. **状態定義を開く**:

   ```text
   packages/agents/src/agents/default_agent/defaultAgentState.ts
   ```

2. **状態の構造を調べる**:

   ```typescript
   const DefaultAgentStateAnnotation = Annotation.Root({
     user_message: Annotation<string>,
     messages: Annotation<Array<BaseMessage>>,
     function_calls: Annotation<Array<FunctionCall>>,
     messageWindowSize: Annotation<number>,
   });
   ```

   - `user_message`: 現在のユーザー入力
   - `messages`: 会話履歴 (HumanMessage, AIMessage, FunctionMessage)
   - `function_calls`: モデルが呼び出したいツール
   - `messageWindowSize`: 含める過去のメッセージ数

3. **`messageWindowSize` を変更してみる**:

   `defaultAgent.ts` で、コンストラクタを変更します:

   ```typescript
   constructor(messageWindowSize: number = 5) {  // 3 から 5 に変更
   ```

   これにより、エージェントが記憶する会話のコンテキストが増えます。

### 演習: カスタム状態フィールドを追加する

特定の情報を追跡するために新しいフィールドを追加してみてください:

1. `user_mood` フィールドを追加して感情を追跡する
2. `conversation_topic` フィールドを追加して主要なトピックを追跡する
3. ノードを変更してこれらのフィールドを更新する

## モジュール 6: 変更のテスト

### テストのベストプラクティス

1. **シンプルに始める**: 基本的なクエリからテストします
   - "Hello"
   - "What is 2+2?"
   - "Tell me a joke"

2. **エッジケースをテストする**: 普通ではない入力を試します
   - 非常に長いメッセージ
   - 空のメッセージ
   - 特殊文字

3. **ログを確認する**: バックエンドのコンソール出力でエラーや予期せぬ挙動を確認します

4. **変更前後を比較する**: 元のコードをコメントアウトして残しておき、挙動を比較できるようにします

### デバッグのヒント

- **TypeScript のコンパイルを確認**: `pnpm build` を実行して型エラーを見つけます
- **ランタイムログを確認**: バックエンドコンソールに詳細な実行フローが表示されます
- **ブラウザの開発者ツールを使用**: Network タブで API のリクエスト/レスポンスを確認します
- **分離してテスト**: CLI を使用してエージェントを直接テストします（以下参照）

### CLI によるテスト

Web インターフェースなしでエージェントを直接テストできます:

```bash
# Default Agent のテスト
pnpm --filter @llmops-demo-ts/agents cli default-agent run -t "ここにメッセージを入力"

# Research Agent のテスト
pnpm --filter @llmops-demo-ts/agents cli research-agent run -t "リサーチしたい質問"
```

## モジュール 7: 上級編 - `createAgent` を使用した ReAct エージェント

### コンセプト: ReAct パターン

**ReAct (Reasoning + Acting)** は、モデルが明示的にアクションを計画し（推論）、ツールを使用してそれを実行し（行動）、その結果を観察するというパラダイムです。このループはタスクが完了するまで続きます。

LangGraph はグラフ構造を完全に制御できますが、LangChain は `createAgent` という高レベルの API を提供しており、堅牢な ReAct ループを事前に構成してくれます。

### ハンズオン演習: シンプルな ReAct エージェントの構築

> **注意:** この演習では `@langchain/google-vertexai` を使用するため、**Vertex AI** の設定（モジュール 01 のオプション B）が必要です。`GOOGLE_CLOUD_PROJECT` が設定され、`gcloud` で認証されていることを確認してください。

この演習では、`createAgent` をデモンストレーションするためのスタンドアロンスクリプトを作成します。ここでは、他のモジュールで使用されているコアの `@google/genai` SDK ではなく、より抽象度の高い **LangChain** ラッパーライブラリ（`@langchain/google-vertexai` と `langchain`）を使用していることに注意してください。

1. **新しいファイルを作成**: `packages/agents/src/simple-react-agent.ts`

2. **以下のコードを追加**:

   ```typescript
   import { z } from "zod";
   import { tool } from "@langchain/core/tools";
   import { ChatGoogleVertexAI } from "@langchain/google-vertexai";
   import { createReactAgent } from "@langchain/langgraph/prebuilt";

   // 1. ツールの定義
   const magicNumberTool = tool(
     async ({ input }) => {
       console.log(`[Tool] magicNumberTool called with: ${input}`);
       return "The magic number is 42.";
     },
     {
       name: "get_magic_number",
       description: "Returns the magic number.",
       schema: z.object({
         input: z.string().describe("Any input string"),
       }),
     },
   );

   async function main() {
     // 2. モデルの初期化
     const model = new ChatGoogleVertexAI({
       model: "gemini-2.5-flash",
       temperature: 0,
     });

     // 3. エージェントの作成
     // createReactAgent は、ReAct パターンを実装するビルド済みの LangGraph エージェントです
     const agent = createReactAgent({
       llm: model,
       tools: [magicNumberTool],
     });

     // 4. エージェントの呼び出し
     console.log("--- Agent Invocation ---");
     const result = await agent.invoke({
       messages: [
         {
           role: "user",
           content: "What is the magic number?",
         },
       ],
     });

     // 5. 結果の出力
     const lastMessage = result.messages[result.messages.length - 1];
     console.log("--- Final Response ---");
     console.log(lastMessage.content);
   }

   main().catch(console.error);
   ```

   _注: LangGraph と互換性のある ReAct エージェントを作成する最新の方法である `@langchain/langgraph/prebuilt` の `createReactAgent` を使用しています。_

3. **スクリプトの実行**:

   開発依存関係に含まれている `tsx` (TypeScript Executor) を使用して実行できます。

   ```bash
   # ルートディレクトリから
   cd packages/agents
   npx tsx src/simple-react-agent.ts
   ```

   **期待される出力:**
   エージェントがツールを呼び出す必要があると「推論 (Reason)」し、`get_magic_number` を呼び出して「行動 (Act)」し、結果（"42"）を観察して、最終的な回答を提供する様子が表示されるはずです。

### なぜ `createAgent` / `createReactAgent` を使うのか？

- **シンプルさ**: ノードやエッジを手動で定義する必要がありません。
- **スピード**: シンプルなエージェントのプロトタイプ作成が高速です。
- **標準化**: ツール呼び出しと推論のための実証済みのパターンを使用します。

ただし、Research Agent のような複雑でカスタムなワークフローの場合、以前のモジュールで行ったようにグラフを手動で構築する方が、より細かい制御が可能になります。

## 重要なポイント

1. **システム指示** は LLM の振る舞いを制御する強力なツールです
2. **マルチステップワークフロー** は複雑なタスクを管理しやすい部分に分割します
3. **カスタムツール** はエージェントの能力をテキスト生成以上に拡張します
4. **構造化出力** は下流のアプリケーションのための信頼性の高いデータ処理を保証します
5. **状態管理** により、エージェントはステップ間でコンテキストを維持できます
6. **テスト** は極めて重要です - 変更が期待通りに動作することを常に検証してください

## よくある落とし穴

1. **再ビルドを忘れる**: 変更後は必ず `pnpm build` を実行してください
2. **バックエンドを再起動しない**: 変更を反映するにはサーバーの再起動が必要です
3. **TypeScript の型を壊す**: 変更後も型安全性が維持されていることを確認してください
4. **プロンプトを複雑にしすぎる**: シンプルに始め、徐々に複雑さを加えてください

## 次のステップ

- **中級者**: [モジュール 03: 中級セキュリティ](./03_intermediate_security.md) に進み、LLM セキュリティガードレールについて学びましょう
- **実験を続ける**: Default Agent と Research Agent にさらに変更を加えてみましょう
- **コードを読む**: エージェントディレクトリ内の他のファイルを探索し、全体的なアーキテクチャを理解しましょう

## 追加リソース

- [Default Agent README](../../../packages/agents/src/agents/default_agent/README.ja.md) - 詳細なアーキテクチャドキュメント
- [Research Agent README](../../../packages/agents/src/agents/research_agent/README.ja.md) - 詳細なアーキテクチャドキュメント
- [LangGraph ドキュメント](https://langchain-ai.github.io/langgraphjs/) - グラフベースのエージェントワークフローについて学ぶ
- [Google Gemini API ドキュメント](https://ai.google.dev/gemini-api/docs) - モデルの機能を理解する
