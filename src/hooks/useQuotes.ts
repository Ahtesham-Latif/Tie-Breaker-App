import { Quote, ALL_QUOTES } from '../quotes';

type Domain = 'BUSINESS' | 'TECH' | 'CAREER' | 'LIFE' | 'ACADEMIC' | 'DECISION';

const PROFESSION_MAP: Record<string, Domain[]> = {
  // Business
  'entrepreneur': ['BUSINESS', 'DECISION'],
  'founder': ['BUSINESS', 'DECISION'],
  'startup': ['BUSINESS', 'DECISION'],
  'marketing': ['BUSINESS', 'DECISION'],
  'sales': ['BUSINESS', 'DECISION'],
  'manager': ['BUSINESS', 'CAREER'],
  'ceo': ['BUSINESS', 'DECISION'],
  'business': ['BUSINESS', 'DECISION'],
  'finance': ['BUSINESS', 'DECISION'],
  'product': ['BUSINESS', 'TECH'],

  // Tech
  'developer': ['TECH', 'CAREER'],
  'engineer': ['TECH', 'CAREER'],
  'programmer': ['TECH', 'CAREER'],
  'software': ['TECH', 'CAREER'],
  'backend': ['TECH', 'CAREER'],
  'frontend': ['TECH', 'CAREER'],
  'fullstack': ['TECH', 'CAREER'],
  'devops': ['TECH', 'CAREER'],
  'data': ['TECH', 'ACADEMIC'],
  'ai': ['TECH', 'CAREER'],
  'ml': ['TECH', 'ACADEMIC'],

  // Career
  'freelancer': ['CAREER', 'BUSINESS'],
  'consultant': ['CAREER', 'BUSINESS'],
  'job': ['CAREER', 'DECISION'],
  'intern': ['CAREER', 'ACADEMIC'],
  'graduate': ['CAREER', 'ACADEMIC'],

  // Academic
  'student': ['ACADEMIC', 'DECISION'],
  'researcher': ['ACADEMIC', 'DECISION'],
  'professor': ['ACADEMIC', 'LIFE'],
  'teacher': ['ACADEMIC', 'LIFE'],
  'phd': ['ACADEMIC', 'DECISION'],
  'university': ['ACADEMIC', 'CAREER'],

  // Life
  'personal': ['LIFE', 'DECISION'],
  'lifestyle': ['LIFE', 'DECISION'],
  'health': ['LIFE', 'DECISION'],
  'family': ['LIFE', 'DECISION'],
};


function detectDomains(myCase?: string): Domain[] {
  if (!myCase) return ['DECISION'];

  const lower = myCase.toLowerCase();
  const matched = new Set<Domain>();

  Object.entries(PROFESSION_MAP).forEach(([keyword, domains]) => {
    if (lower.includes(keyword)) {
      domains.forEach(d => matched.add(d));
    }
  });

  // Always include DECISION as fallback
  matched.add('DECISION');

  return matched.size > 0 ? Array.from(matched) : ['DECISION'];
}

export function getRandomQuotes(n: number, myCase?: string): Quote[] {
  const domains = detectDomains(myCase);

  // Filter to matching domains first
  const domainQuotes = ALL_QUOTES.filter(q => domains.includes(q.domain as Domain));

  // If not enough domain quotes, pad with DECISION quotes
  const pool = domainQuotes.length >= n
    ? domainQuotes
    : [
        ...domainQuotes,
        ...ALL_QUOTES.filter(q => q.domain === 'DECISION')
      ];

  // Deduplicate and shuffle
  const unique = Array.from(new Map(pool.map(q => [q.text, q])).values());
  return unique.sort(() => Math.random() - 0.5).slice(0, Math.min(n, unique.length));
}

export function useQuotes() {
  return { getRandomQuotes, total: ALL_QUOTES.length };
}
