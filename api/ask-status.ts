import type { VercelRequest, VercelResponse } from '@vercel/node';
import { configured } from './_lib/agent';

/** 화면이 대화 버튼을 띄울지 판단한다. 설정이 없으면 enabled:false만 주고
 *  에러는 노출하지 않는다. */
export default function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', 'GET');
    return res.status(405).json({ ok: false, enabled: false });
  }
  return res.status(200).json({ ok: true, enabled: configured() });
}
