import { expect } from 'chai';

import { cspMiddleware } from '../index.js';

describe('1. cspMiddleware', () => {

  let headerName, headerValue;
  const res = {
    set: (name, value) => {
      headerName = name;
      headerValue = value;
    },
    get: name => headerValue
  };

  describe('1.1. When called with "policies"', () => {
    // return;

    describe('1.1.1. When one policy is given with one allowance', () => {
      it('1.1.1. Should return a handler that includes setting the "Content-Security-Policy" on the response header', () => {
        const { handler } = cspMiddleware({ 'default-src': ["'self'"] });
        handler({}, res, () => null);
        expect(headerName).to.equal('Content-Security-Policy');
        expect(headerValue).to.equal("default-src 'self'");
      });
    });

    describe('1.1.2. When one policy is given with multiple allowances', () => {
      it('1.1.2.1. Should return a handler that includes "Content-Security-Policy" on the response header', () => {
        const { handler } = cspMiddleware({ 'script-src': ["'self'", 'example.com'] });
        handler({}, res, () => null);
        expect(headerName).to.equal('Content-Security-Policy');
        expect(headerValue).to.equal("script-src 'self' example.com");
      });
    });

    describe('1.1.3. When two policies are given with one allowance each', () => {
      it('1.1.3.1. Should return a handler that includes setting the "Content-Security-Policy" on the response header', () => {
        const { handler } = cspMiddleware({
          'default-src': ["'self'"],
          'img-src': ['*']
        });
        handler({}, res, () => null);
        expect(headerName).to.equal('Content-Security-Policy');
        expect(headerValue).to.equal("default-src 'self'; img-src *");
      });
    });

    describe('1.1.4. When two policies are given with one allowance each', () => {
      it('1.1.4.1. Should return a handler that includes setting the "Content-Security-Policy" on the response header', () => {
        const { handler } = cspMiddleware({
          'media-src': ['example.org', 'example.net'],
          'script-src': ['example.dev', 'example.com']
        });
        handler({}, res, () => null);
        expect(headerName).to.equal('Content-Security-Policy');
        expect(headerValue).to.equal('media-src example.org example.net; script-src example.dev example.com');
      });
    });

  });

  // return;

  describe('1.2. When called with "numberOfNonces"', () => {
    // return;
    describe('1.2.2. When "policies" is null', () => {

      it('1.2.2.1. Should add no policies and one nonce to the header', () => {
        const { handler } = cspMiddleware(null);
        handler({}, res, () => null);
        const nonce = res.getNonce();
        expect(headerValue).to.equal(`script-src 'nonce-${nonce}'`);
      });

      it('1.2.2.2. Should add no policies and multiple nonces to the header', () => {
        const { handler } = cspMiddleware(null);
        handler({}, res, () => null);
        const nonce1 = res.getNonce();
        const nonce2 = res.getNonce();
        expect(headerValue).to.equal(`script-src 'nonce-${nonce1}' 'nonce-${nonce2}'`);
      });

    });

    describe('1.2.3. When "policies" are given', () => {

      it('1.2.3.1. Should add the policies and one nonce to the header', () => {
        const { handler } = cspMiddleware({ 'default-src': ["'self'"] });
        handler({}, res, () => null);
        const nonce = res.getNonce();
        expect(headerValue).to.equal(`default-src 'self'; script-src 'nonce-${nonce}'`);
      });

      it('1.2.3.2. Should add the policies and multiple nonces to the header', () => {
        const { handler } = cspMiddleware({
          'default-src': "'self' example.com",
          'img-src': '*',
        });
        handler({}, res, () => null);
        const nonce1 = res.getNonce();
        const nonce2 = res.getNonce();
        expect(headerValue).to.equal(`default-src 'self' example.com; img-src *; script-src 'nonce-${nonce1}' 'nonce-${nonce2}'`);
      });

      it('1.2.3.3. Should add the policies and multiple nonces to the header, including other "script-src" added in policies', () => {
        const { handler } = cspMiddleware({
          'default-src': "'self' example.com",
          'img-src': '*',
          'script-src': 'example.dev example.net'
        });
        handler({}, res, () => null);
        const nonce1 = res.getNonce();
        const nonce2 = res.getNonce();
        expect(headerValue).to.equal(`default-src 'self' example.com; img-src *; script-src example.dev example.net 'nonce-${nonce1}' 'nonce-${nonce2}'`);
      });

    });

  });

});