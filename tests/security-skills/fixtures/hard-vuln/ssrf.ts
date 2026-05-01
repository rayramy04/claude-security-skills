// Fixture (Hard): SSRF（Server-Side Request Forgery）
// ユーザーが指定した URL にサーバーからリクエストする

export async function POST(req: Request) {
  const { webhookUrl, orgId } = await req.json();

  // 一見ビジネス的に正当な機能（Webhook 登録）
  // ❌ webhookUrl のホスト・プロトコルをユーザーが自由に指定できる
  // 攻撃者が http://169.254.169.254/metadata（Azure IMDS）を指定すると
  // クラウドの認証情報が漏洩する可能性がある
  const response = await fetch(webhookUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ event: "test", orgId }),
  });

  const result = await response.json();
  return Response.json({ success: true, result });
}
