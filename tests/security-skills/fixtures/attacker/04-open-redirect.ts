// Fixture (Attacker): OAuth コールバック後のオープンリダイレクト
// 認証フロー完了後に攻撃者サイトへリダイレクトさせてセッショントークンを盗む
//
// 攻撃手順:
// 1. 攻撃者が /auth/callback?code=xxx&state=https://phishing.com のリンクを被害者に踏ませる
// 2. 認証は正常に完了する
// 3. 被害者が phishing.com にリダイレクトされる（URL バーが変わるので気づきにくい）
// 4. phishing.com がリファラーやアクセストークンを盗む

import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const code = searchParams.get("code");
  const returnTo = searchParams.get("state") || "/";   // state に戻り先 URL を入れる設計

  if (!code) {
    return NextResponse.redirect("/login");
  }

  // Azure AD からトークン取得（正当な処理）
  const tokenRes = await fetch("https://login.microsoftonline.com/token", {
    method: "POST",
    body: new URLSearchParams({ code, grant_type: "authorization_code" }),
  });
  const { access_token } = await tokenRes.json();

  if (!access_token) {
    return NextResponse.redirect("/login?error=auth_failed");
  }

  // セッション Cookie をセット
  const response = NextResponse.redirect(returnTo);  // ❌ state の値を検証せずリダイレクト
  response.cookies.set("session", access_token, { httpOnly: true });
  return response;
}
