#!/usr/bin/env node
/**
 * CI smoke test to verify traces are exported to a Jaeger collector
 * Steps:
 *  - poll /health until backend is available
 *  - invoke an endpoint that is instrumented to create spans
 *  - wait a short while to allow exporter to ship spans
 *  - query the Jaeger API for traces for the service
 */
const fetch = globalThis.fetch || require('node-fetch');

const BACKEND = process.env.BACKEND_URL || 'http://localhost:3000';
// TRACE_QUERY_API: endpoint for the tracing query API (Jaeger or Tempo compatible)
const TRACE_QUERY_API = process.env.TRACE_QUERY_API || process.env.JAEGER_API || process.env.TEMPO_API || 'http://localhost:3100';

async function waitFor(url, timeout = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeout) {
    try {
      const r = await fetch(url);
      if (r.ok) return true;
    } catch (err) {
      // ignore
    }
    await new Promise((r) => setTimeout(r, 1000));
  }
  return false;
}

async function main() {
  console.log('Waiting for backend health...');
  const up = await waitFor(`${BACKEND}/health`, 30000);
  if (!up) {
    console.error('Backend health check failed');
    process.exit(2);
  }

  // create a simple register request that will generate a trace
  const uniq = Date.now().toString(36);
  const registerBody = {
    email: `smoke-${uniq}@example.com`,
    password: 'Password123!',
    full_name: `Smoke Test ${uniq}`,
    organization_id: `org-${uniq}`,
  };

  console.log('Triggering instrumented endpoint (register)...');
  const resp = await fetch(`${BACKEND}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(registerBody),
  });

  if (![200,201].includes(resp.status)) {
    console.warn('Register endpoint returned non-success: ', resp.status);
  }

  // wait a bit for exporter to send the span
  console.log('Waiting for traces to be exported (10s)...');
  await new Promise((r) => setTimeout(r, 10000));

  // query trace backend (Tempo/Jaeger compatible) for traces for service 'diagnosticox-backend'
  const apiUrl = `${TRACE_QUERY_API}/api/traces?service=diagnosticox-backend&limit=20`;
  console.log('Querying trace API at:', apiUrl);

  try {
    const jresp = await fetch(apiUrl);
    if (!jresp.ok) {
      console.error('Failed to query Jaeger API', jresp.status);
      process.exit(3);
    }
    const payload = await jresp.json();
    const data = payload?.data || [];
    // Look through the traces and their spans to ensure an auth.register span exists
    let foundRegisterSpan = false;
    let foundSessionId = false;
    let foundUserId = false;
    if (Array.isArray(data) && data.length > 0) {
      for (const trace of data) {
        const spans = trace?.spans || [];
        for (const s of spans) {
          if (s?.operationName === 'auth.register' || (s?.operationName && s.operationName.includes('auth.register'))) {
            foundRegisterSpan = true;
          }

          // tags can appear as 'tags' array (Jaeger) or attributes object (other backends)
          const tags = s?.tags || s?.attributes || [];
          if (Array.isArray(tags)) {
            for (const t of tags) {
              const k = t?.key || t?.k || t?.name;
              const v = t?.value || t?.v;
              if (!k) continue;
              if (k === 'session.id') foundSessionId = true;
              if (k === 'user.id') foundUserId = true;
            }
          } else if (typeof tags === 'object') {
            if (tags['session.id']) foundSessionId = true;
            if (tags['user.id']) foundUserId = true;
          }
          if (foundRegisterSpan && foundSessionId && foundUserId) break;
        }
        if (foundRegisterSpan) break;
      }
    }

    if (foundRegisterSpan && foundSessionId && foundUserId) {
      console.log('Found auth.register span with session.id and user.id in trace backend — Smoke test SUCCESS');
      process.exit(0);
    }
    console.error('No traces found for service diagnosticox-backend with required attributes');
    process.exit(4);
  } catch (err) {
    console.error('Error querying Jaeger API:', err?.message || err);
    process.exit(5);
  }
}

main();
