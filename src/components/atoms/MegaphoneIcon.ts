import { createLucideIcon } from 'lucide-react';

// 설치된 lucide-react(0.471)의 Megaphone은 납작한 구버전 디자인이라,
// lucide v1 의 새 Megaphone 경로로 같은 형태의 아이콘을 만든다.
export const MegaphoneIcon = createLucideIcon('Megaphone', [
  [
    'path',
    {
      d: 'M11 6a13 13 0 0 0 8.4-2.8A1 1 0 0 1 21 4v12a1 1 0 0 1-1.6.8A13 13 0 0 0 11 14H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2z',
      key: 'body',
    },
  ],
  [
    'path',
    {
      d: 'M6 14a12 12 0 0 0 2.4 7.2 2 2 0 0 0 3.2-2.4A8 8 0 0 1 10 14',
      key: 'handle',
    },
  ],
  ['path', { d: 'M8 6v8', key: 'divider' }],
]);
