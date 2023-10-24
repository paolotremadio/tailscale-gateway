const axios = require('axios');

const config = require('./config');
const cloudflare = require('./cloudflare')(config.cloudflare);
const caddyFile = require('./caddyfile.json');

const vhosts = [];

(async () => {
  await Promise.all(Object.entries(config.services).map(async ([host, details]) => {
    const destination = details.uri;
    vhosts.push({
      "match": [
        {
          "host": [
            host
          ]
        }
      ],
      "handle": [
        {
          "handler": "reverse_proxy",
          "upstreams": [
            {
              "dial": details.uri.replace('http://', ''),
            }
          ]
        }
      ]
    })

    let dnsStatus;
    try {
      await cloudflare.declareService(host);
      dnsStatus = `✅️ DNS record updated`;
    }
    catch (e) {
      dnsStatus = `⛔️ DNS record not updated: ${e}`;
    }

    console.log(`➡️ Proxying "${host}" to ${destination} (${dnsStatus})`);
  }));


  vhosts.push({
    "match": [
      {
        "host": [
          "*"
        ]
      }
    ],
    "handle": [
      {
        "handler": "static_response",
        "status_code": "200",
        "body": "CADDY: host not configured yet"
      }
    ]
  });

  // Attach host to default config
  caddyFile.apps.http.servers['tailscale-proxy-server'].routes = vhosts;

  try {
    await axios.post('http://caddy:2019/load', caddyFile);
    console.log(`✅️ Caddy config updated`);
  } catch (e) {
    console.log(`⛔️ Failure in updated Caddy config: ${e}`);
  }

  console.log('🚀 Server started');

  // Keep container running
  setInterval(() => true, 10000);
})();
