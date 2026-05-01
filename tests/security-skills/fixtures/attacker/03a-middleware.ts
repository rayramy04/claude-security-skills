// Fixture (Attacker): 複数ファイルにまたがる認可バイパス - Part A
// このファイル単体では問題なく見える
// middleware でトークンの「存在」のみチェックしているが、orgId は検証しない

import { NextRequest, NextResponse } from "next/server";
import jwt from "jsonwebtoken";

export function middleware(req: NextRequest) {
  const token = req.headers.get("Authorization")?.replace("Bearer ", "");

  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // トークンの署名を検証（これ自体は正しい）
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string;
      orgIds: string[];  // ← このユーザーが所属する org の一覧
    };

    // userId を後続リクエストのヘッダーに転送
    const requestHeaders = new Headers(req.headers);
    requestHeaders.set("X-User-Id", decoded.userId);
    // ❌ orgIds はヘッダーに転送しない → ルートハンドラーが独自に orgId を検証できない

    return NextResponse.next({ request: { headers: requestHeaders } });
  } catch {
    return NextResponse.json({ error: "Invalid token" }, { status: 401 });
  }
}
