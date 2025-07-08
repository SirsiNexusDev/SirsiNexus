-- Add name column to users table (nullable first)
ALTER TABLE users ADD COLUMN name STRING;

-- Update existing users to have a default name
UPDATE users SET name = 'User' WHERE name IS NULL;

-- Make the column NOT NULL after backfill
ALTER TABLE users ALTER COLUMN name SET NOT NULL;
