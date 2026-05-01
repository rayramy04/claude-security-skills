// Fixture (Hard Safe): DOMPurify でサニタイズ済みの dangerouslySetInnerHTML
// dangerouslySetInnerHTML を使っているが、安全

import React from "react";
import DOMPurify from "dompurify";

interface Props {
  richText: string; // CMS から来るリッチテキスト
}

// ✅ DOMPurify でサニタイズしてから渡している → 安全
export function RichTextDisplay({ richText }: Props) {
  const clean = DOMPurify.sanitize(richText, {
    ALLOWED_TAGS: ["b", "i", "em", "strong", "p", "br"],
    ALLOWED_ATTR: [],
  });

  return (
    <div
      className="rich-text"
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
