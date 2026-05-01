-- Add new columns first
ALTER TABLE "User" ADD COLUMN "firstName" TEXT;
ALTER TABLE "User" ADD COLUMN "lastName" TEXT;

-- Data migration: split at the very last space
UPDATE "User" SET 
  "firstName" = CASE 
    WHEN array_length(string_to_array("name", ' '), 1) > 1 THEN 
      array_to_string((string_to_array("name", ' '))[1:array_length(string_to_array("name", ' '), 1)-1], ' ')
    ELSE "name"
  END,
  "lastName" = CASE 
    WHEN array_length(string_to_array("name", ' '), 1) > 1 THEN 
      (string_to_array("name", ' '))[array_length(string_to_array("name", ' '), 1)]
    ELSE NULL
  END
WHERE "name" IS NOT NULL;

-- Drop old column
ALTER TABLE "User" DROP COLUMN "name";
