// Fixture (Hard): PII・認証情報のログ出力
// ログに見えるが、実は機密情報を出力している

import { InvocationContext } from "@azure/functions";

interface LoginRequest {
  email: string;
  password: string;
  orgId: string;
}

export async function handleLogin(body: LoginRequest, context: InvocationContext) {
  const { email, password, orgId } = body;

  // ❌ パスワードをそのままログに出力
  context.log(`Login attempt: email=${email}, password=${password}, orgId=${orgId}`);

  const user = await authenticate(email, password);

  if (!user) {
    // ❌ 失敗時も認証情報を含めてログ出力
    context.error(`Authentication failed for email=${email} password=${password}`);
    return { status: 401 };
  }

  // ❌ JWTトークンをログに出力
  const token = generateToken(user);
  context.log(`Token issued: ${token}`);

  return { status: 200, token };
}

async function authenticate(email: string, password: string) {
  // 省略
  return null;
}

function generateToken(user: any) {
  return "dummy-token";
}
