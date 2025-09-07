import { WellDataRow } from '@/types/well';
import { pipeline } from '@xenova/transformers';
import { NextResponse } from 'next/server';

let embedder: any;

function flattenEmbedding(output: number[] | { data: number[] }): number[] {
  if (Array.isArray(output)) return output;
  return Array.from(output.data);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, v, i) => sum + v * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return dot / (magA * magB);
}

export async function POST(req: Request) {
  const { message, wellData } = await req.json();

  if (!embedder) {
    embedder = await pipeline('feature-extraction', 'Xenova/all-MiniLM-L6-v2');
  }

  const lowerMsg = message.toLowerCase();

  // --- Dynamic numeric queries ---
  const numericColumns = Object.keys(wellData[0] || {}).filter(
    (k) => typeof wellData[0][k] === 'number'
  );

  const results: string[] = [];

  for (const col of numericColumns) {
    const colName = col.toLowerCase();

    if (lowerMsg.includes(colName)) {
      const values: number[] = wellData.map((row: WellDataRow) => row[col] as number);
      const minVal = Math.min(...values);
      const maxVal = Math.max(...values);
      const avgVal = values.reduce((a: number, b: number) => a + b, 0) / values.length;


      // Check for min+max in the same query
      if (
        (lowerMsg.includes('minimum') && lowerMsg.includes('maximum')) ||
        (lowerMsg.includes('min') && lowerMsg.includes('max')) ||
        (lowerMsg.includes('lowest') && lowerMsg.includes('highest'))
      ) {
        results.push(
          `${col}: min = ${minVal.toFixed(2)}, max = ${maxVal.toFixed(2)}`
        );
      } else if (
        lowerMsg.includes('minimum') ||
        lowerMsg.includes('smallest') ||
        lowerMsg.includes('lowest')
      ) {
        results.push(`Min ${col}: ${minVal.toFixed(2)}`);
      } else if (
        lowerMsg.includes('maximum') ||
        lowerMsg.includes('largest') ||
        lowerMsg.includes('highest')
      ) {
        results.push(`Max ${col}: ${maxVal.toFixed(2)}`);
      } else if (lowerMsg.includes('average') || lowerMsg.includes('mean')) {
        results.push(`Average ${col}: ${avgVal.toFixed(2)}`);
      }
    }
  }

  if (results.length > 0) {
    return NextResponse.json({ answer: results.join('\n') });
  }

  // --- Fallback: semantic search ---
  const qEmbedding = flattenEmbedding(await embedder(message));

  let bestMatch = null;
  let bestScore = -Infinity;

  for (const row of wellData) {
    const text = Object.entries(row)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');

    const emb = flattenEmbedding(await embedder(text));
    const score = cosineSimilarity(qEmbedding, emb);

    if (score > bestScore) {
      bestScore = score;
      bestMatch = row;
    }
  }

  return NextResponse.json({
    answer: bestMatch
      ? Object.entries(bestMatch)
        .map(([k, v]) => `${k}: ${v}`)
        .join(', ')
      : 'No relevant data found',
  });
}
