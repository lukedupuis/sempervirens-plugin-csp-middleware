import Server from '@sempervirens/server';
import { RequestHandler } from '@sempervirens/endpoint';
// import { cspMiddleware } from '@sempervirens/plugins';

import { cspMiddleware } from '../index.js';

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