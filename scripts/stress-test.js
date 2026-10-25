const autocannon = require('autocannon');

const baseUrl = 'http://localhost:3000';
const stages = [100, 500, 1000];
const duration = 10;
const targets = [
  { name: 'Bosh sahifa', path: '/' },
  { name: 'Health API', path: '/api/health' },
  { name: 'E’lonlar API', path: '/api/listings' },
];

async function runLoadTest(target, connections) {
  return new Promise((resolve) => {
    const instance = autocannon(
      {
        url: `${baseUrl}${target.path}`,
        connections,
        duration,
        pipelining: 1,
      },
      (err, result) => {
        if (err) {
          console.error(`Xato: ${err.message}`);
          resolve({ requests: { average: 0, total: 0 }, latency: { p95: 0, p99: 0 }, errors: 0 });
        } else {
          resolve(result);
        }
      }
    );

    // Avtomatik progress bar ni o'chirib qo'yamiz (u natijalarni chalkashtirishi mumkin)
    autocannon.track(instance, { renderProgressBar: false });
  });
}

function formatNumber(value) {
  return new Intl.NumberFormat('en-US').format(value);
}

async function main() {
  console.log(`Stress test target: ${baseUrl}`);
  console.log(`Duration per endpoint: ${duration}s\n`);

  for (const connections of stages) {
    console.log(`\n=== ${connections} connections ===`);
    console.log(
      `${'Endpoint'.padEnd(18)} ${'Req/Sec'.padStart(10)} ${'p95 (ms)'.padStart(12)} ${'p99 (ms)'.padStart(12)} ${'Total'.padStart(12)} ${'Errors'.padStart(12)}`,
    );

    for (const target of targets) {
      const result = await runLoadTest(target, connections);
      
      const reqPerSec = result.requests ? result.requests.average : 0;
      const p95 = result.latency ? result.latency.p95 : 0;
      const p99 = result.latency ? result.latency.p99 : 0;
      const total = result.requests ? result.requests.total : 0;
      const errors = result.errors || 0;

      console.log(
        `${target.name.padEnd(18)} ${formatNumber(Math.round(reqPerSec)).padStart(10)} ${formatNumber(p95).padStart(12)} ${formatNumber(p99).padStart(12)} ${formatNumber(total).padStart(12)} ${formatNumber(errors).padStart(12)}`,
      );
    }
  }
}

main().catch(console.error);