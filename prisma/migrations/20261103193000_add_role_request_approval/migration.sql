-- Add approval state to role requests and remove the duplicated User.asked_role field.
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;

CREATE TABLE "new_Role_Managment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "requested_role" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL DEFAULT false,
    CONSTRAINT "Role_Managment_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Role_Managment" ("id", "requested_role", "user_id")
SELECT "id", "requested_role", "user_id" FROM "Role_Managment";
DROP TABLE "Role_Managment";
ALTER TABLE "new_Role_Managment" RENAME TO "Role_Managment";
CREATE UNIQUE INDEX "Role_Managment_user_id_key" ON "Role_Managment"("user_id");

CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT'
);
INSERT INTO "new_User" ("email", "id", "name", "password", "role")
SELECT "email", "id", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

DROP INDEX "Professor_userId_key";
CREATE UNIQUE INDEX "Professor_user_id_key" ON "Professor"("user_id");
DROP INDEX "RoomFeature_name_key";
CREATE UNIQUE INDEX "Room_Feature_name_key" ON "Room_Feature"("name");

PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
