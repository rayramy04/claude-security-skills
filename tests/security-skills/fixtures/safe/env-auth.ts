// Fixture: Safe - 環境変数でAPIキー管理（偽陽性テスト用）

// ✅ 環境変数から取得（安全）
const apiKey = process.env.OPENAI_API_KEY;
const cosmosKey = process.env.COSMOS_CONNECTION_STRING;

export async function callAI(prompt: string) {
  if (!apiKey) throw new Error("OPENAI_API_KEY is not set");

  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ model: "gpt-4", messages: [{ role: "user", content: prompt }] }),
  });
  return response.json();
}
