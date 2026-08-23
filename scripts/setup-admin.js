#!/usr/bin/env node
import fs from 'fs/promises';
import crypto from 'crypto';
import readline from 'readline';
import bcrypt from 'bcrypt';

const envPath = new URL('../.env', import.meta.url);

function setVar(env, key, value) {
  const re = new RegExp('^' + key.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&') + '=.*$', 'm');
  if (re.test(env)) return env.replace(re, `${key}=${value}`);
  return env.trimEnd() + '\n' + `${key}=${value}\n`;
}

async function main() {
  // Generate secrets
  const s1 = crypto.randomBytes(32).toString('hex');
  const s2 = crypto.randomBytes(32).toString('hex');

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });

  const question = (q, options) => new Promise((res) => rl.question(q, options, res));

  const email = await question('Admin email: ');
  const password = await question('Admin password (input hidden): ', { hideEchoBack: true });
  rl.close();

  const hash = await bcrypt.hash(password, 12);

  // Read existing .env
  let env = '';
  try {
    env = await fs.readFile(envPath, 'utf8');
  } catch (e) {
    env = '';
  }

  env = setVar(env, 'JWT_ADMIN_SECRET', s1);
  env = setVar(env, 'JWT_CLIENT_SECRET', s2);
  env = setVar(env, 'ADMIN_EMAIL', email);
  env = setVar(env, 'ADMIN_PASSWORD_HASH', hash);

  await fs.writeFile(envPath, env, { encoding: 'utf8' });
  // Minimal output to signal completion — do NOT print secrets or email
  console.log('OK');
}

main().catch((err) => {
  console.error('Error:', err.message || err);
  process.exit(1);
});
