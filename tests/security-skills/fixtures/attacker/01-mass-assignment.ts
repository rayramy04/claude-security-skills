// Fixture (Attacker): Mass Assignment（大量代入攻撃）
// 一見バリデーションしているように見えるが、
// ユーザー入力を全フィールド spread することで任意フィールドを上書きできる

import { CosmosClient } from "@azure/cosmos";
const client = new CosmosClient(process.env.COSMOS_CONNECTION_STRING!);
const users = client.database("analytics").container("users");

export async function updateProfile(req: Request) {
  const userId = req.headers.get("X-MS-CLIENT-PRINCIPAL-ID")!;
  const body = await req.json();

  // 開発者はここで「name は必須」とバリデーションしている
  if (!body.name || typeof body.name !== "string") {
    return Response.json({ error: "name is required" }, { status: 400 });
  }

  const { resource: existing } = await users.item(userId, userId).read();

  // ❌ body を全フィールド spread → 攻撃者が role: "admin" や orgId: "他人のorg" を
  //    body に混ぜると既存ドキュメントのあらゆるフィールドを上書きできる
  await users.items.upsert({
    ...existing,
    ...body,           // ← ここが問題
    id: userId,        // id だけは上書きされないよう後置しているが不十分
  });

  return Response.json({ success: true });
}
