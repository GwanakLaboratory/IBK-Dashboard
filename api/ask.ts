import type { VercelRequest, VercelResponse } from '@vercel/node';
import { ask } from './_lib/agent';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', 'POST');
    return res
      .status(405)
      .json({ ok: false, reason: 'POST만 지원합니다', ms: 0 });
  }

  const question =
    typeof req.body === 'object' &&
    req.body &&
    typeof req.body.question === 'string'
      ? req.body.question
      : '';

  const result = await ask(question);
  return res.status(200).json(result);
}
