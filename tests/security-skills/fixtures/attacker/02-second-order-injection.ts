// Fixture (Attacker): 2次インジェクション（Second-Order Injection）
// 保存時はサニタイズするが、取り出して使うときに再サニタイズしない
// 攻撃者はペイロードを一度「安全に」保存させ、後で発火させる

import { CosmosClient } from "@azure/cosmos";
const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
const tags = client.database("analytics").container("tags");
const reports = client.database("analytics").container("reports");

// Step 1: タグを保存（一見サニタイズ済み）
export async function createTag(req: Request) {
  const { name } = await req.json();

  // XSS 対策として < > だけ除去（不完全なサニタイズ）
  const safeName = name.replace(/[<>]/g, "");

  // ✅ 保存時点では SQL インジェクションは起きない（パラメーター化）
  await tags.items.create({ name: safeName, createdAt: Date.now() });
  return Response.json({ success: true });
}

// Step 2: 保存済みタグ名を使ってレポートを検索（ここが脆弱）
export async function getReportByTagName(tagId: string) {
  // DB から取得した値は「安全」と思い込んでいる
  const { resource: tag } = await tags.item(tagId, tagId).read();

  // ❌ DB から取得した値を再サニタイズなしでクエリに埋め込む
  // 攻撃者が name = "normal') OR ('1'='1" というタグ名を保存していた場合、
  // ここで全レポートが取れる
  const query = `SELECT * FROM c WHERE c.tag = '${tag.name}' AND c.type = 'report'`;

  const { resources } = await reports.items.query(query).fetchAll();
  return resources;
}
