import getNonce from './getNonce.js';

const cspMiddleware = policies => {
  policies = policies || {};

  const stringified = Object
    .keys(policies)
    .reduce((acc, name) => {
      const policy = policies[name];
      acc.push(`${name} ${policy.join ? policy.join(' ') : policy}; `);
      return acc;
    }, [])
    .join('')
    .slice(0, -2);

  return {
    handler: (req, res, next) => {
      res.set('Content-Security-Policy', stringified);
      res.getNonce = () => getNonce(res);
      next();
    }
  };
};

export default cspMiddleware;