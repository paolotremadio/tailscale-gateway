const axios = require('axios');

module.exports = (config) => {
  const { apiKey, zoneId, baseDomain, node } = config;

  const client = axios.create({
    baseURL: 'https://api.cloudflare.com/client/v4/',
    headers: {
      authorization: `Bearer ${apiKey}`,
    },
    timeout: 30000,
  });

  return {
    declareService: async (serviceName) => {
      const { data: { result: records } } = await client.get(`zones/${zoneId}/dns_records`);

      const recordName = `${serviceName}.service.${baseDomain}`;

      // Check if record exists
      let recordId;
      records.forEach(({ id, name }) => {
        if (name === recordName) {
          recordId = id;
        }
      });


      // Update record
      const payload = {
        content: `${node}.node.${baseDomain}`,
        name: recordName,
        proxied: false,
        type: 'CNAME',
        ttl: 1,
      };

      if (recordId) {
        await client.patch(`zones/${zoneId}/dns_records/${recordId}`, payload);
      } else {
        await client.post(`zones/${zoneId}/dns_records`, payload);
      }
    }
  };
};
