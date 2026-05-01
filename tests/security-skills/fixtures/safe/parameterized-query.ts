// Fixture: Safe - パラメーター化クエリ（偽陽性テスト用）

import { CosmosClient } from "@azure/cosmos";

const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);

export async function getOrganization(orgId: string) {
  // ✅ パラメーター化クエリ（安全）
  const query = {
    query: "SELECT * FROM c WHERE c.orgId = @orgId AND c.type = 'organization'",
    parameters: [{ name: "@orgId", value: orgId }],
  };

  const { resources } = await client
    .database("analytics")
    .container("organizations")
    .items.query(query)
    .fetchAll();

  return resources;
}
