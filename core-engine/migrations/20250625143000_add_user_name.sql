-- Add name column to users table
ALTER TABLE users ADD COLUMN name STRING NOT NULL DEFAULT '';

-- Update existing users to have a default name
UPDATE users SET name = 'User' WHERE name = '';
