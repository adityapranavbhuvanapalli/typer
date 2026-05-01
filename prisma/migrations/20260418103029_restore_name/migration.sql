-- Add back old column
ALTER TABLE "User" ADD COLUMN "name" TEXT;

-- Repopulate existing rows backward
UPDATE "User" SET "name" = 
  CASE 
    WHEN "lastName" IS NOT NULL THEN "firstName" || ' ' || "lastName"
    ELSE "firstName"
  END
WHERE "firstName" IS NOT NULL;
