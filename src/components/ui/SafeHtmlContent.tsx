'use client';

import React from 'react';

/**
 * 백엔드에서 HTML 엔티티 이스케이프된 문자열을 렌더링할 때 사용합니다.
 * 예: <script>alert(1)</script> → &lt;script&gt;alert(1)&lt;/script&gt; 로 저장/반환된 경우
 *
 * 이 문자열을 그대로 innerHTML로 넣으면 브라우저가 엔티티를 해석해
 * - 스크립트는 실행되지 않고 화면에 문자로만 표시되고
 * - 정상 HTML(예: <p>, <strong>)은 포맷팅되어 보입니다.
 * 별도 디코딩 없이 백엔드 응답을 그대로 전달하면 됩니다.
 */
interface SafeHtmlContentProps {
  html: string;
  className?: string;
  as?: keyof React.JSX.IntrinsicElements;
}

export function SafeHtmlContent({
  html,
  className,
  as: Tag = 'div',
}: SafeHtmlContentProps) {
  if (!html) return null;
  return (
    <Tag
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
