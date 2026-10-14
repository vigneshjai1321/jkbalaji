-- Optional second password hash. Null for every account except where explicitly set.
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "password_hash_alt" TEXT;
