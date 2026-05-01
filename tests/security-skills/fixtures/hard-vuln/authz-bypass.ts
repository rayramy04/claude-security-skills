// Fixture (Hard): 認可バイパス（横断的アクセス）
// 認証はされているが、認可（自分のデータか？）が欠如している
// ビジネスロジックを知らないと見つけにくい

import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);

// この関数は Azure Easy Auth によって認証済みユーザーのみが呼べる
// ヘッダー X-MS-CLIENT-PRINCIPAL-ID に userId が入る
export async function getOrganizationReport(req: Request) {
  const userId = req.headers.get("X-MS-CLIENT-PRINCIPAL-ID"); // 認証済み ✅
  const { orgId } = await req.json();

  // ❌ orgId がこの userId に属しているかチェックしていない
  // 攻撃者は自分の userId で認証しつつ、他人の orgId を指定できる
  // 例: 競合他社の orgId を総当たりすると全組織のデータが取れる
  const { resources } = await client
    .database("analytics")
    .container("reports")
    .items.query({
      query: "SELECT * FROM c WHERE c.orgId = @orgId",
      parameters: [{ name: "@orgId", value: orgId }],
    })
    .fetchAll();

  return resources;
}
