// Fixture: XSS via dangerouslySetInnerHTML
// 意図的に脆弱なコード - テスト用

import React from "react";

interface Props {
  userComment: string;  // ユーザーが入力した値
}

// ❌ ユーザー入力をそのまま innerHTML に渡す
export function CommentDisplay({ userComment }: Props) {
  return (
    <div
      className="comment-body"
      dangerouslySetInnerHTML={{ __html: userComment }}
    />
  );
}

// ❌ eval でユーザー入力を実行
export function runFormula(expression: string) {
  return eval(expression);
}
