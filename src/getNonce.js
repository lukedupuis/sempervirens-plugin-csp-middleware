import crypto from 'crypto';

const getNonce = res => {
  const nonce = crypto.randomBytes(16).toString('base64');
  let scriptSrc;
  const csp = res.get('Content-Security-Policy')
    .split('; ')
    .filter(policy => {
      if (policy.startsWith('script-src')) {
        scriptSrc = policy;
        return false;
      }
      return true;
    });
  if (!scriptSrc) scriptSrc = 'script-src';
  scriptSrc += ` 'nonce-${nonce}'`;
  csp.push(scriptSrc);
  res.set('Content-Security-Policy', csp.filter(Boolean).join('; '));
  return nonce;
};

export default getNonce;