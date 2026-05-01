// ⚠️ WARNING: This file contains INTENTIONALLY FAKE credentials for testing purposes.
// These are NOT real API keys or connection strings.
// Do NOT copy these values — they are designed to be detected by security scanners.

// Fixture: Hardcoded API Key
// 意図的に脆弱なコード - テスト用

// ❌ APIキーをハードコード
const OPENAI_API_KEY = "sk-proj-abc123XYZhardcodedSecretKey9999";
const COSMOS_CONNECTION = "AccountEndpoint=https://myaccount.documents.azure.com:443/;AccountKey=abc123hardcodedkey==;";

export async function callAI(prompt: string) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    headers: {
      Authorization: `Bearer ${OPENAI_API_KEY}`,
      "Content-Type": "application/json",
    },
    method: "POST",
    body: JSON.stringify({ model: "gpt-4", messages: [{ role: "user", content: prompt }] }),
  });
  return response.json();
}
