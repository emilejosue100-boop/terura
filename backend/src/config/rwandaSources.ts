export interface RwandaSource {
  url: string;
  label: string;
}

export const RWANDA_FINANCE_SOURCES: RwandaSource[] = [
  { url: 'https://www.bnr.rw/', label: 'National Bank of Rwanda (BNR)' },
  { url: 'https://www.rse.rw/', label: 'Rwanda Stock Exchange (RSE)' },
  { url: 'https://www.bk.rw/', label: 'Bank of Kigali' },
  { url: 'https://www.urwegofinance.com/', label: 'Urwego Finance' },
  { url: 'https://rdb.rw/investment/', label: 'RDB Investment Opportunities' },
];

export const FIRECRAWL_SEARCH_QUERY =
  'Rwanda savings investment opportunities SACCO treasury bonds agriculture cooperative 2025 2026';
