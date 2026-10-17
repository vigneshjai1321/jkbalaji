-- Manager usernames (login_id) without changing password hashes or user ids.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "login_id" TEXT;

CREATE UNIQUE INDEX IF NOT EXISTS "users_login_id_key" ON "users"("login_id") WHERE "login_id" IS NOT NULL;

UPDATE "users"
SET "login_id" = 'realestateadmin'
WHERE lower("email") = 'realestate_admin@jkbalaji.in'
  AND ("login_id" IS NULL OR "login_id" = '');

UPDATE "users"
SET "login_id" = 'jewelleryadmin'
WHERE lower("email") = 'jewellery_admin@jkbalaji.in'
  AND ("login_id" IS NULL OR "login_id" = '');
