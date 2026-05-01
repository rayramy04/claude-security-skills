// Fixture (Hard): 偽のエスケープ処理
// エスケープしているように見えるが、まだ危険

import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);

export async function searchOrganizations(req: Request) {
  const { name } = await req.json();

  // 一見エスケープしているように見える
  const safeName = name.replace(/'/g, "''");

  // ❌ まだテンプレートリテラルで埋め込んでいる
  // CosmosDB SQL は LIKE 句でワイルドカードが使えるため
  // % や _ によるインジェクションが可能
  const query = `SELECT * FROM c WHERE CONTAINS(c.name, '${safeName}')`;

  const { resources } = await client
    .database("analytics")
    .container("organizations")
    .items.query(query)
    .fetchAll();

  return resources;
}
