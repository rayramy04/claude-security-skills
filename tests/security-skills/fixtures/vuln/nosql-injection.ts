// Fixture: NoSQL Injection (CosmosDB)
// 意図的に脆弱なコード - テスト用

import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);

export async function getOrganization(req: Request) {
  const { orgId } = await req.json();

  // ❌ ユーザー入力をそのままクエリに埋め込む
  const query = `SELECT * FROM c WHERE c.orgId = '${orgId}' AND c.type = 'organization'`;

  const { resources } = await client
    .database("analytics")
    .container("organizations")
    .items.query(query)
    .fetchAll();

  return resources;
}
