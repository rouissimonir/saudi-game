// Local simulation only. "999" represents a temporary database outage.
const http = require('http');
http.createServer((req, res) => {
  const path = new URL(req.url, 'http://localhost').pathname;
  if (req.method !== 'POST' || !['/rest/v1/rpc/enqueue_refill', '/rest/v1/rpc/process_refill_inbox'].includes(path)) {
    res.writeHead(501); return res.end();
  }
  if (req.headers.apikey !== 'local-service-key' || req.headers.authorization !== 'Bearer local-service-key') {
    res.writeHead(401); return res.end();
  }
  const body = req.body;
  // Simulate a worker outage after the event has already been accepted.
  if (path === '/rest/v1/rpc/process_refill_inbox') {
    if (!body || body.p_limit !== 50) { res.writeHead(400); return res.end(); }
    res.writeHead(503); return res.end();
  }
  if (!body || body.p_event !== 'event-123' || body.p_user !== 'b928f790-1234-4123-8123-0123456789ab' ||
      body.p_environment !== 'SANDBOX' || !['purchase', 'refund'].includes(body.p_kind) ||
      !['123456789', '999'].includes(body.p_transaction)) {
    res.writeHead(400); return res.end();
  }
  if (body.p_transaction === '999') { res.writeHead(503); return res.end(); }
  res.writeHead(200, { 'Content-Type': 'application/json' }); res.end('null');
}).listen(process.env.PORT || 4500);
