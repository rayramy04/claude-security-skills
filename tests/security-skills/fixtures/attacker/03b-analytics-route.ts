// Fixture (Attacker): 複数ファイルにまたがる認可バイパス - Part B
// 03a-middleware.ts と合わせて読まないと脆弱性が見えない
//
// middleware は「認証済み」を保証するが orgId の所有権は保証しない
// このルートは orgId をリクエストボディから受け取り、所有権チェックなしで使う

import { CosmosClient } from "@azure/cosmos";
const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);

export async function POST(req: Request) {
  // middleware が付与した userId（本物）
  const userId = req.headers.get("X-User-Id")!;

  const { orgId, startDate, endDate } = await req.json();

  // ❌ userId が orgId に所属しているか確認していない
  // 攻撃者は自分の正規トークンで認証し、
  // 他社の orgId を body に指定して競合他社のデータを取得できる
  //
  // middleware では JWT の orgIds を転送していないため、
  // ここでは「誰が正規ユーザーか」しか分からず、
  // 「そのユーザーがこの orgId にアクセスしていいか」が検証できない

  const { resources } = await client
    .database("analytics")
    .container("reports")
    .items.query({
      query: `SELECT * FROM c
              WHERE c.orgId = @orgId
              AND c.date >= @start AND c.date <= @end`,
      parameters: [
        { name: "@orgId", value: orgId },
        { name: "@start", value: startDate },
        { name: "@end", value: endDate },
      ],
    })
    .fetchAll();

  return Response.json({ data: resources });
}
