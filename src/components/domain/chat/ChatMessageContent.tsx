import type { ReactNode } from 'react';
import { RISK_LEVEL_META } from '@/utils/risk';

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

function findRowRiskColor(row: string[]): string | null {
  const label = row[0] ?? '';
  const match = Object.values(RISK_LEVEL_META).find((meta) =>
    label.includes(meta.label),
  );
  return match?.dotColorClassName ?? null;
}

export function ChatMessageContent({ text }: ChatMessageContentProps) {
  const blocks = parseBlocks(text);

  return (
    <div className="space-y-2">
      {blocks.map((block, blockIndex) => {
        if (block.type === 'table') {
          return (
            <table
              key={blockIndex}
              className="w-full overflow-hidden rounded-lg border border-gray-200 text-xs"
            >
              <thead>
                <tr className="bg-gray-50">
                  {block.headers.map((header, headerIndex) => (
                    <th
                      key={headerIndex}
                      className={`px-2.5 py-1.5 font-medium text-gray-500 ${
                        headerIndex === 0 ? 'text-left' : 'text-right'
                      }`}
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-gray-50">
                {block.rows.map((row, rowIndex) => {
                  const dotColorClassName = findRowRiskColor(row);
                  return (
                    <tr key={rowIndex} className="border-t border-gray-100">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className={`px-2.5 py-1.5 ${
                            cellIndex === 0
                              ? 'text-left font-medium text-gray-700'
                              : 'text-right text-gray-900'
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
          );
        }

        return (
          <p key={blockIndex} className="leading-relaxed">
            {renderInlineBold(block.line, `p-${blockIndex}`)}
          </p>
        );
      })}
    </div>
  );
}
