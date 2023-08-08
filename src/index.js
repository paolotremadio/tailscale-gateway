const express = require('express');
const vhost = require('express-vhost');
const httpProxy = require('http-proxy');

const config = require('./config');
const cloudflare = require('./cloudflare')(config.cloudflare);

const server = express();
server.disable('x-powered-by');

const proxyTo = (uri) => {
  const proxy = httpProxy.createProxyServer({ target: uri, ws: true });
  return (req, res) => {
    // console.log("proxying GET request", req.url);
    proxy.web(req, res, {});
  };
};

(async () => {
  await Promise.all(Object.entries(config.services).map(async ([host, details]) => {
    const destination = details.uri;
    vhost.register(host, proxyTo(destination));

    let dnsStatus;
    try {
      await cloudflare.declareService(host, details.destinationServer);
      dnsStatus = `✅️ DNS record updated`;
    } catch (e) {
      dnsStatus = `⛔️ DNS record not updated: ${e}`;
    }

    console.log(`➡️ Proxying "${host}" to ${destination} (${dnsStatus})`);
  }));

  server.use(vhost.vhost(server.enabled('trust proxy')));

  server.listen(9000, '0.0.0.0', () => console.log('🚀 Server started'));
})();
