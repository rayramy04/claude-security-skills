// Fixture (Attacker): CORS + Credentials の組み合わせによる横断的データ窃取
// 単独では問題なく見えるが、2つの設定の組み合わせが危険
//
// 攻撃手順:
// 1. 攻撃者が evil.com を用意し、被害者を誘導する
// 2. evil.com から fetch("https://app.example.com/api/analytics", { credentials: "include" })
// 3. ACAO がリクエスト元の Origin を反射 → evil.com が許可される
// 4. ACAC: true → Cookie（セッション）付きでリクエストが通る
// 5. 被害者の認証済みセッションで全データが取得される

export async function OPTIONS(req: Request) {
  const origin = req.headers.get("Origin") ?? "*";

  // ❌ リクエスト元の Origin をそのまま反射（ホワイトリストなし）
  // ❌ Allow-Credentials: true と組み合わせることで任意サイトからの
  //    認証済みクロスオリジンリクエストを許可してしまう
  return new Response(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Credentials": "true",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    },
  });
}

export async function POST(req: Request) {
  const origin = req.headers.get("Origin") ?? "*";

  // GET/POST にも同じ CORS ヘッダーを付与
  const res = await handleAnalytics(req);
  res.headers.set("Access-Control-Allow-Origin", origin);     // ❌
  res.headers.set("Access-Control-Allow-Credentials", "true"); // ❌
  return res;
}

async function handleAnalytics(req: Request) {
  return Response.json({ data: [] });
}
