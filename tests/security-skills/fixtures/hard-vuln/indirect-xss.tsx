// Fixture (Hard): 間接的な XSS（ヘルパー関数経由）
// dangerouslySetInnerHTML を直接使っていないように見えるが、
// ヘルパー経由でユーザー入力が HTML として挿入される

import React from "react";

// ヘルパー関数（一見無害そう）
function renderMarkdown(text: string): string {
  // **太字** を <strong> に変換
  let html = text.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
  // [リンク](url) を <a> タグに変換
  // ❌ href にユーザー入力が入る → javascript: スキームが通る
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>');
  return html;
}

interface Props {
  comment: string; // ユーザーが入力した値
}

// ❌ renderMarkdown の戻り値を dangerouslySetInnerHTML に渡している
// renderMarkdown 自体はサニタイズしていない
export function CommentCard({ comment }: Props) {
  return (
    <div
      className="comment"
      dangerouslySetInnerHTML={{ __html: renderMarkdown(comment) }}
    />
  );
}
