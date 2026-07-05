import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { probeGeminiConnection } from '../src/services/geminiClient.js';
import { scrapeRwandaFinanceSources } from '../src/services/firecrawl.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../.env') });

async function main() {
  const gemini = await probeGeminiConnection();
  const firecrawl = await scrapeRwandaFinanceSources();
  console.log(
    JSON.stringify(
      {
        gemini,
        firecrawl: {
          configured: firecrawl.configured,
          sourceCount: firecrawl.sourceCount,
          contextLength: firecrawl.context.length,
        },
      },
      null,
      2
    )
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
