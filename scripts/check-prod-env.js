const fs = require('node:fs');
const path = require('node:path');

const requiredVariables = [
  'DATABASE_URL',
  'DIRECT_URL',
  'NEXTAUTH_SECRET',
  'NEXTAUTH_URL',
  'REDIS_URL',
  'UPSTASH_REDIS_REST_URL',
  'UPSTASH_REDIS_REST_TOKEN',
  'SENTRY_DSN',
  'NEXT_PUBLIC_SENTRY_DSN',
  'GEMINI_API_KEY',
  'TELEGRAM_BOT_TOKEN',
  'TELEGRAM_CHAT_ID',
  'TELEGRAM_SECRET_TOKEN',
];

function readEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {};

  const values = {};
  const contents = fs.readFileSync(filePath, 'utf8');
  for (const line of contents.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*?)\s*$/.exec(line);
    if (!match) continue;

    const [, name, rawValue] = match;
    const value = rawValue.replace(/^(['"])(.*)\1$/, '$2').trim();
    if (value && !value.startsWith('#')) values[name] = value;
  }
  return values;
}

const envFile = readEnvFile(path.resolve(process.cwd(), '.env'));
const missing = requiredVariables.filter(
  (name) => !(process.env[name] || envFile[name] || '').trim(),
);

if (missing.length > 0) {
  console.error('\x1b[31m%s\x1b[0m', 'Yetishmayotgan environment o‘zgaruvchilari:');
  for (const name of missing) console.error(`  - ${name}`);
  process.exitCode = 1;
} else {
  console.log(
    '\x1b[32m%s\x1b[0m',
    'Barcha environment o‘zgaruvchilari mavjud!',
  );
}
