# Sempervirens Plugin: CSP Middleware

An interface for adding Content-Security-Policy Express response headers. See <a href="https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP" target="_blank">MDN Web Docs: "Content Security Policy (CSP)"</a> for more information about the header. `cspMiddleware` may also be used to add nonces to script tags. See <a href="https://content-security-policy.com/nonce/" target="_blank">Content Security Policy.com: "Using a nonce with CSP"</a> for more information about nonces.

## Installation

`npm i @sempervirens/plugin-csp-middleware`

## Usage

```
import Server from '@sempervirens/server';
import { RequestHandler } from '@sempervirens/endpoint';
import { cspMiddleware } from '@sempervirens/plugins';

// Example only, separate file recommended
const template = ({ nonces, firstName = 'World' }) => {
  return '' +
`
<html>
<head>
  <!-- No CSP error because header allows 'script-src': ['cdn.jsdelivr.net'] -->
  <script src="https://cdn.jsdelivr.net/npm/lodash@4.17.21/lodash.min.js"></script>
  <!-- No CSP error because nonce was added with numberOfNonces and req.getNonce -->
  <script nonce="${nonces[0]}">alert("Hello ${firstName}, from a nonce'd <script> tag!");</script>
</head>
<body>
  <h1>Hello again, ${firstName}!</h1>
  <p>The following changes to camelCase in 5 seconds to demonstrate CSP allowing lodash via cdn.jsdelivr.net.</p>
  <p id="camel-case">CAMEL CASE</p>
  <script nonce="${nonces[1]}">
    setTimeout(() => {
      document.getElementById('camel-case').innerHTML = _.camelCase('CAMEL CASE');
    }, 5000);
  </script>
</body>
</html>
`
};

// Example only, separate file recommended
class Test1RequestHandler extends RequestHandler {
  constructor({ req, res, data, isSecure }) {
    super({ req, res, data, isSecure });
    this.#init(req.params);
  }
  #init({ firstName }) {
    const nonces = [this.res.getNonce(), this.res.getNonce()];
    const html = template({ nonces, firstName });
    this.res.send(html);
  }
}

// Example only, separate file recommended
const siteLoaderConfig = {
  domain: 'site-1',
  middleware: [
    cspMiddleware({
      'default-src': "'self'",
      'img-src': '*',
      'media-src': 'example.org example.net', // Can be either a space-delimited string
      'script-src': ['cdn.jsdelivr.net', 'example.com'] // Or a string[]
    })
  ],
  endpoints: [
    {
      path: 'GET /page-1/:firstName?',
      handler: Test1RequestHandler
    }
  ]
}

new Server({ sites: [siteLoaderConfig] }).start();
```

## API

`cspMiddleware(policies)`

### policies

Required. A key:value object with the policy name as the key. For example, `script-src`. The value is a space-delimited string or an array of strings containing each of the allowed items. For example, `'example.com example.net'` or `['example.com', 'example.net']`.

### res.getNonce

Adds a nonce to the "Content-Security-Policy" header. It also returns the nonce so it can be passed into the HTML template and added to `<script nonce="${nonce}"></script>`. Multiple nonces may be added by calling `res.getNonce()` multiple times. See the example in the script above. `getNonce` is also exported separately so it can be used independently of `cspMiddleware`.