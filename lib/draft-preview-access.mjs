/** Shared pure gate, also safe to import from middleware. */
export function isDraftPreviewEnabled(env, host) {
  return env.NODE_ENV === 'development' && env.PORTFOLIO_DRAFT_PREVIEW === '1' &&
    !env.VERCEL_ENV && /^(localhost|127\.0\.0\.1|\[::1\])(?::[0-9]{1,5})?$/.test(host || '');
}
