import * as argon2 from 'argon2';
import pg from 'pg';

const email = 'admin@jkbalaji.in';
const password = (await new Promise((resolve, reject) => {
  const chunks = [];
  process.stdin.on('data', (chunk) => chunks.push(chunk));
  process.stdin.on('end', () => resolve(Buffer.concat(chunks).toString('utf8').trim()));
  process.stdin.on('error', reject);
}));

if (!password || !process.env.DATABASE_URL) {
  console.error('SET_FAILED');
  process.exit(1);
}

const hash = await argon2.hash(password);
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const updated = await pool.query('UPDATE users SET password_hash_alt = $1 WHERE email = $2', [hash, email]);
const user = await pool.query(
  `SELECT email, role::text AS role,
          (password_hash_alt IS NOT NULL) AS has_alt,
          left(password_hash_alt, 9) AS prefix,
          length(password_hash_alt) AS len,
          (password_hash_alt = $2) AS stored_plaintext
   FROM users WHERE email = $1`,
  [email, password],
);
const others = await pool.query(
  'SELECT count(*)::int AS n FROM users WHERE password_hash_alt IS NOT NULL AND email <> $1',
  [email],
);
console.log(
  JSON.stringify({
    updated: updated.rowCount,
    user: user.rows[0] ?? null,
    otherAccountsWithAlt: others.rows[0].n,
  }),
);
await pool.end();
