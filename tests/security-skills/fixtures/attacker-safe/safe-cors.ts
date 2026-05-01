// Fixture (Attacker Safe): Origin ホワイトリストによる安全な CORS 設定
// Origin を動的に処理しているが、ホワイトリスト検証済みなので安全

const ALLOWED_ORIGINS = [
  "https://app.example.com",
  "https://staging.example.com",
  "http://localhost:3000",
];

function getAllowedOrigin(requestOrigin: string | null): string {
  // ✅ ホワイトリストに含まれる場合のみそのオリジンを返す
  // 含まれない場合は最初の許可オリジンを返す（またはリジェクト）
  if (requestOrigin && ALLOWED_ORIGINS.includes(requestOrigin)) {
    return requestOrigin;
  }
  return ALLOWED_ORIGINS[0];
}

export async function OPTIONS(req: Request) {
  const origin = getAllowedOrigin(req.headers.get("Origin"));

  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,      // ✅ ホワイトリスト検証済み
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    },
  });
}
