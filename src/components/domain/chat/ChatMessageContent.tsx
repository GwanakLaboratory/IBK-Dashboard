import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import i18n, { SUPPORTED_LANGUAGES } from '@/i18n';
import type { RiskLevel } from '@/types/churn';
import { RISK_LEVEL_DISPLAY_ORDER, RISK_LEVEL_META } from '@/utils/risk';

type ChatMessageContentProps = {
  text: string;
};

type TableBlock = { type: 'table'; headers: string[]; rows: string[][] };
type ParagraphBlock = { type: 'paragraph'; line: string };
type Block = TableBlock | ParagraphBlock;

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map((cell) => cell.trim());
}

function isSeparatorRow(cells: string[]): boolean {
  return cells.length > 0 && cells.every((cell) => /^:?-{2,}:?$/.test(cell));
}

function parseBlocks(text: string): Block[] {
  const lines = text.split('\n');
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i].trim();
    const isTableStart =
      line.startsWith('|') &&
      i + 1 < lines.length &&
      isSeparatorRow(splitRow(lines[i + 1]));

    if (isTableStart) {
      const headers = splitRow(line);
      const rows: string[][] = [];
      i += 2;
      while (i < lines.length && lines[i].trim().startsWith('|')) {
        rows.push(splitRow(lines[i]));
        i += 1;
      }
      blocks.push({ type: 'table', headers, rows });
      continue;
    }

    if (line.length > 0) {
      blocks.push({ type: 'paragraph', line });
    }
    i += 1;
  }

  return blocks;
}

function renderInlineBold(line: string, keyPrefix: string): ReactNode {
  const parts = line
    .split(/(\*\*[^*]+\*\*)/g)
    .filter((part) => part.length > 0);
  return parts.map((part, index) =>
    part.startsWith('**') && part.endsWith('**') ? (
      <strong key={`${keyPrefix}-${index}`}>{part.slice(2, -2)}</strong>
    ) : (
      <span key={`${keyPrefix}-${index}`}>{part}</span>
    ),
  );
}

/*
 * 위험도 이름이 다른 단어 속에 묻혀 있지 않은지 볼 때 쓴다.
 * 앞은 영문자·한글이 아니어야 하고('중위험' 속 '위험' 제외),
 * 뒤는 영문자만 아니면 된다('Highest' 제외, '위험군'처럼 한글이 붙는 건 허용).
 */
const BEFORE = '(^|[^A-Za-z\uAC00-\uD7A3])';
const AFTER = '($|[^A-Za-z])';

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * 표 첫 칸에 위험도 이름이 있으면 그 위험도 색을 돌려준다.
 * 이미 보낸 답변은 보낸 때의 언어로 남아 있으므로 모든 언어의 이름과 비교한다.
 * '위험'은 '중위험'·'저위험' 안에도 들어 있으므로 긴 이름부터 비교하고,
 */
function findRowRiskColor(row: string[]): string | null {
  const label = row[0] ?? '';
  const candidates = SUPPORTED_LANGUAGES.flatMap((language) =>
    RISK_LEVEL_DISPLAY_ORDER.map((level): [RiskLevel, string] => [
      level,
      i18n.t(`domain.riskLevel.${level}`, { lng: language }),
    ]),
  ).sort((a, b) => b[1].length - a[1].length);
  const match = candidates.find(([, name]) =>
    new RegExp(`${BEFORE}${escapeRegExp(name)}${AFTER}`).test(label),
  );
  return match ? RISK_LEVEL_META[match[0]].dotColorClassName : null;
}

export function ChatMessageContent({ text }: ChatMessageContentProps) {
  // 언어를 바꾸면 다시 그린다
  useTranslation();
  const blocks = parseBlocks(text);

  return (
    <div>
      {blocks.map((block, blockIndex) => {
        // 문단 사이는 촘촘하게, 표 앞뒤는 넉넉하게 띄운다
        const previous = blocks[blockIndex - 1];
        const spacingClassName = !previous
          ? ''
          : block.type === 'table' || previous.type === 'table'
            ? 'mt-4'
            : 'mt-2.5';

        if (block.type === 'table') {
          return (
            <div
              key={blockIndex}
              className={`overflow-x-auto rounded-lg border border-slate-200 bg-white shadow-sm ${spacingClassName}`}
            >
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-700">
                    {block.headers.map((header, headerIndex) => (
                      <th
                        key={headerIndex}
                        className={`whitespace-nowrap px-2.5 py-2 text-xs font-semibold text-white ${
                          headerIndex === 0 ? 'text-left' : 'text-right'
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {block.rows.map((row, rowIndex) => {
                    const dotColorClassName = findRowRiskColor(row);
                    return (
                      <tr
                        key={rowIndex}
                        className="border-t border-slate-100 odd:bg-white even:bg-slate-50"
                      >
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className={`whitespace-nowrap px-2.5 py-2 ${
                              cellIndex === 0
                                ? 'text-left font-medium text-slate-700'
                                : 'text-right font-semibold tabular-nums text-slate-900'
                            }`}
                          >
                            {cellIndex === 0 && dotColorClassName && (
                              <span
                                className={`mr-1.5 inline-block h-2 w-2 rounded-full ${dotColorClassName}`}
                              />
                            )}
                            {cell}
                          </td>
                        ))}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          );
        }

        return (
          <p key={blockIndex} className={spacingClassName}>
            {renderInlineBold(block.line, `p-${blockIndex}`)}
          </p>
        );
      })}
    </div>
  );
}
