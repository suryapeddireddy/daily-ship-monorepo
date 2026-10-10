CREATE TYPE "ProjectCollaboratorRole" AS ENUM ('ADMIN', 'VIEWER');

ALTER TABLE "ProjectCollaborator"
ADD COLUMN "role" "ProjectCollaboratorRole" NOT NULL DEFAULT 'ADMIN';
