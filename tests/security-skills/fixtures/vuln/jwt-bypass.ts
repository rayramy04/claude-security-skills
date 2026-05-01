// Fixture: JWT Verification Bypass
// 意図的に脆弱なコード - テスト用

import jwt from "jsonwebtoken";

// ❌ verify ではなく decode（署名を検証しない）
export function getUser(token: string) {
  const decoded = jwt.decode(token);  // 署名検証なし！誰でも偽造できる
  return decoded as { userId: string; role: string };
}

// ❌ alg: none を許可
export function verifyToken(token: string) {
  return jwt.verify(token, "", { algorithms: ["none", "HS256"] });
}
