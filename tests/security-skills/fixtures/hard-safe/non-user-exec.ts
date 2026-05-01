// Fixture (Hard Safe): ユーザー入力が渡らない exec
// exec を使っているが、引数はハードコード済みで安全

import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// ✅ 引数はすべてハードコード（ユーザー入力は渡っていない）
export async function runHealthCheck() {
  const { stdout } = await execAsync("node --version");
  return { nodeVersion: stdout.trim() };
}

// ✅ ユーザー入力は数値バリデーション済みの後、クエリパラメーターに渡すだけ
export async function getReport(year: number, month: number) {
  if (!Number.isInteger(year) || !Number.isInteger(month)) {
    throw new Error("Invalid parameters");
  }
  // year と month は整数チェック済みなのでインジェクション不可
  const { stdout } = await execAsync(`node scripts/generate-report.js ${year} ${month}`);
  return stdout;
}
