export function isFarcaster() {
  return typeof window !== 'undefined' && window.parent !== window && /farcaster/i.test(navigator.userAgent);
} 