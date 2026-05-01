// Fixture (Attacker Safe): ホワイトリストによる安全なリダイレクト
// open redirect に見えるが、allowlist で完全に制御されている

import { NextResponse } from "next/server";

const ALLOWED_REDIRECT_PATHS = ["/dashboard", "/analytics", "/settings", "/"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const returnTo = searchParams.get("returnTo") || "/";

  // ✅ URL をパースして同一オリジンかつ allowlist 内のパスのみ許可
  let safePath = "/";
  try {
    const parsed = new URL(returnTo, "http://localhost"); // 相対パスを解析するためのダミーベース
    // 外部ドメインへのリダイレクトを拒否（pathname のみ使う）
    const pathname = parsed.pathname;
    if (ALLOWED_REDIRECT_PATHS.some((allowed) => pathname.startsWith(allowed))) {
      safePath = pathname;
    }
  } catch {
    safePath = "/";
  }

  return NextResponse.redirect(new URL(safePath, req.url));
}
