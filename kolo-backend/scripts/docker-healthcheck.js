const http = require('http');

const port = process.env.PORT || 3000;
const host = process.env.HEALTHCHECK_HOST || '127.0.0.1';
const path = process.env.HEALTHCHECK_PATH || '/v1/health';
const timeoutMs = Number(process.env.HEALTHCHECK_TIMEOUT_MS || 3000);

const req = http.request(
  {
    host,
    port: Number(port),
    path,
    method: 'GET',
    timeout: timeoutMs,
  },
  (res) => {
    res.resume();
    process.exit(res.statusCode && res.statusCode >= 200 && res.statusCode < 500 ? 0 : 1);
  },
);

req.on('timeout', () => {
  req.destroy(new Error('Healthcheck timed out'));
});

req.on('error', () => {
  process.exit(1);
});

req.end();
