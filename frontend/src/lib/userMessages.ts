import type { Language } from '../types';
import { HAS_API_PROXY } from '../generated/apiProxy';

export type MessageContext =
  | 'login'
  | 'register'
  | 'committee'
  | 'save'
  | 'loan'
  | 'repay'
  | 'approve'
  | 'profile'
  | 'opportunity'
  | 'general';

interface UserMessageInput {
  language: Language;
  status?: number;
  serverError?: string;
  context?: MessageContext;
  code?: 'network' | 'misconfigured' | 'not_json' | 'unknown';
}

const messages = {
  wrongPin: {
    en: 'Incorrect PIN. Please check your 4-digit code and try again.',
    rw: "Nomero y'ibanga si yo. Reba umubare w'imibare 4 hanyuma ugerageze.",
  },
  accountNotFound: {
    en: 'No account found for this phone number. Use Join to register, or ask your committee.',
    rw: 'Nta konti ibonetse kuri iyi telefone. Kanda Iyandikishe cyangwa ubaze komite yawe.',
  },
  committeeNotFound: {
    en: 'No committee account found for this phone number.',
    rw: 'Nta konti ya komite ibonetse kuri iyi telefone.',
  },
  notCommittee: {
    en: 'This phone number is a member account, not a committee account. Use Sign In instead.',
    rw: 'Iyi telefone ni konti y’umunyamuryango, si ya komite. Koresha Injira.',
  },
  alreadyRegistered: {
    en: 'This phone number is already registered. Use Sign In instead.',
    rw: 'Iyi telefone wasanzwe wayandikishije. Koresha Injira.',
  },
  nameRequired: {
    en: 'Please enter your full name to create an account.',
    rw: 'Andika izina ryawe ryose uce ufungura konti.',
  },
  network: {
    en: 'Could not connect. Check your internet connection and try again.',
    rw: 'Ntitwashoboye guhuza. Reba ko ufite interineti hanyuma ugerageze.',
  },
  serverUnreachable: {
    en: 'Terura is temporarily unavailable. Please try again in a few minutes.',
    rw: 'Terura ntiboneka ubu. Ongera ugerageze mu minota mike.',
  },
  serverDown: {
    en: 'Our servers are busy right now. Please try again shortly.',
    rw: 'Seriveri zacu ziri gukora. Ongera ugerageze vuba.',
  },
  saveFailed: {
    en: 'Your savings could not be recorded. Please try again.',
    rw: 'Ntibyashobokera kubika amafaranga yawe. Ongera ugerageze.',
  },
  loanFailed: {
    en: 'Your loan request could not be sent. Please try again.',
    rw: 'Ntibyashobokera kohereza ubusabe bw’inguzanyo. Ongera ugerageze.',
  },
  repayFailed: {
    en: 'Repayment could not be processed. Please try again.',
    rw: 'Kwishyura ntibyakunze. Ongera ugerageze.',
  },
  approveFailed: {
    en: 'That action could not be completed. Please try again.',
    rw: 'Igikorwa nticyakunze. Ongera ugerageze.',
  },
  profileFailed: {
    en: 'Your profile could not be updated. Please try again.',
    rw: 'Imyirondoro yawe ntiyavuguruwe. Ongera ugerageze.',
  },
  registerFailed: {
    en: 'Member registration failed. Check the details and try again.',
    rw: 'Kwandika umunyamuryango byanze. Reba amakuru hanyuma ugerageze.',
  },
  opportunityFailed: {
    en: 'Could not refresh opportunities right now. Try again later.',
    rw: 'Ntibyashoboye kuvugurura amahirwe ubu. Ongera ugerageze.',
  },
  loginFailed: {
    en: 'Sign in failed. Check your phone number and PIN.',
    rw: 'Kwinjira byanze. Reba telefone n’umubare w’ibanga.',
  },
  committeeLoginFailed: {
    en: 'Committee sign in failed. Check your phone number and PIN.',
    rw: 'Kwinjira komite byanze. Reba telefone n’umubare w’ibanga.',
  },
  generic: {
    en: 'Something went wrong. Please try again.',
    rw: 'Hari ikintu kitagenze neza. Ongera ugerageze.',
  },
} as const;

function pick(language: Language, pair: { en: string; rw: string }): string {
  return language === 'rw' ? pair.rw : pair.en;
}

/** Prefer a clean bilingual server message when it looks user-facing. */
function fromServer(serverError: string | undefined, language: Language): string | null {
  if (!serverError?.trim()) return null;
  const parts = serverError.split(' / ').map((part) => part.trim());
  if (parts.length >= 2) {
    return language === 'rw' ? parts[parts.length - 1] : parts[0];
  }
  return serverError;
}

export function getUserMessage(input: UserMessageInput): string {
  const { language, status, serverError, context = 'general', code } = input;
  const fromApi = fromServer(serverError, language);
  if (fromApi && status && status >= 400 && status < 500 && status !== 405) {
    return fromApi;
  }

  if (code === 'network') {
    return pick(language, messages.network);
  }

  if (code === 'misconfigured' || code === 'not_json' || status === 405) {
    return pick(language, messages.serverUnreachable);
  }

  if (status === 401) {
    return pick(language, messages.wrongPin);
  }

  if (status === 403 && context === 'committee') {
    return pick(language, messages.notCommittee);
  }

  if (status === 404 && context === 'committee') {
    return pick(language, messages.committeeNotFound);
  }

  if (status === 404 && (context === 'login' || context === 'register')) {
    return pick(language, messages.accountNotFound);
  }

  if (status === 409) {
    return pick(language, messages.alreadyRegistered);
  }

  if (status === 503 || status === 502 || status === 504) {
    return pick(language, messages.serverDown);
  }

  switch (context) {
    case 'login':
      return pick(language, messages.loginFailed);
    case 'committee':
      return pick(language, messages.committeeLoginFailed);
    case 'register':
      return pick(language, messages.registerFailed);
    case 'save':
      return pick(language, messages.saveFailed);
    case 'loan':
      return pick(language, messages.loanFailed);
    case 'repay':
      return pick(language, messages.repayFailed);
    case 'approve':
      return pick(language, messages.approveFailed);
    case 'profile':
      return pick(language, messages.profileFailed);
    case 'opportunity':
      return pick(language, messages.opportunityFailed);
    default:
      return fromApi ?? pick(language, messages.generic);
  }
}

export function getApiConfigWarning(language: Language): string | null {
  if (!import.meta.env.PROD) return null;
  if (import.meta.env.VITE_API_URL || HAS_API_PROXY) return null;
  return language === 'rw'
    ? 'Terura ntiboneka — reba niba BACKEND_URL yashyizweho kuri Vercel.'
    : 'Terura cannot reach the server — set BACKEND_URL on Vercel to your Render API URL, then redeploy.';
}
