/*
  Warnings:

  - You are about to drop the column `logId` on the `Course` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `Lesson` table. All the data in the column will be lost.
  - You are about to drop the column `createdBy` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `updatedBy` on the `Log` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `Professor` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `ProfessorUnavailability` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `Room` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `RoomFeature` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `Rule` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `Schedule` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `Shift` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `logId` on the `Violation` table. All the data in the column will be lost.
  - Added the required column `entity` to the `Log` table without a default value. This is not possible if the table is not empty.

*/
-- CreateTable
CREATE TABLE "Session" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" INTEGER NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "degree" TEXT,
    "year" INTEGER,
    "semester" INTEGER
);
INSERT INTO "new_Course" ("acronym", "degree", "id", "name", "semester", "year") SELECT "acronym", "degree", "id", "name", "semester", "year" FROM "Course";
DROP TABLE "Course";
ALTER TABLE "new_Course" RENAME TO "Course";
CREATE UNIQUE INDEX "Course_acronym_key" ON "Course"("acronym");
CREATE TABLE "new_Lesson" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "date" DATETIME NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "scheduleId" INTEGER NOT NULL,
    "shiftId" INTEGER NOT NULL,
    "roomId" INTEGER,
    "professorId" INTEGER,
    CONSTRAINT "Lesson_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lesson_shiftId_fkey" FOREIGN KEY ("shiftId") REFERENCES "Shift" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Lesson_roomId_fkey" FOREIGN KEY ("roomId") REFERENCES "Room" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Lesson_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Lesson" ("date", "endTime", "id", "professorId", "roomId", "scheduleId", "shiftId", "startTime") SELECT "date", "endTime", "id", "professorId", "roomId", "scheduleId", "shiftId", "startTime" FROM "Lesson";
DROP TABLE "Lesson";
ALTER TABLE "new_Lesson" RENAME TO "Lesson";
CREATE TABLE "new_Log" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "action" TEXT NOT NULL,
    "entity" TEXT NOT NULL,
    "entityId" INTEGER,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "actorId" INTEGER,
    CONSTRAINT "Log_actorId_fkey" FOREIGN KEY ("actorId") REFERENCES "User" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Log" ("action", "createdAt", "id", "updatedAt") SELECT "action", "createdAt", "id", "updatedAt" FROM "Log";
DROP TABLE "Log";
ALTER TABLE "new_Log" RENAME TO "Log";
CREATE TABLE "new_Professor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "Professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Professor" ("email", "id", "name", "userId") SELECT "email", "id", "name", "userId" FROM "Professor";
DROP TABLE "Professor";
ALTER TABLE "new_Professor" RENAME TO "Professor";
CREATE UNIQUE INDEX "Professor_email_key" ON "Professor"("email");
CREATE UNIQUE INDEX "Professor_userId_key" ON "Professor"("userId");
CREATE TABLE "new_ProfessorUnavailability" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "professorId" INTEGER NOT NULL,
    CONSTRAINT "ProfessorUnavailability_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_ProfessorUnavailability" ("dayOfWeek", "endTime", "id", "professorId", "startTime") SELECT "dayOfWeek", "endTime", "id", "professorId", "startTime" FROM "ProfessorUnavailability";
DROP TABLE "ProfessorUnavailability";
ALTER TABLE "new_ProfessorUnavailability" RENAME TO "ProfessorUnavailability";
CREATE TABLE "new_Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "building" TEXT,
    "capacity" INTEGER NOT NULL,
    "type" TEXT NOT NULL
);
INSERT INTO "new_Room" ("building", "capacity", "id", "name", "type") SELECT "building", "capacity", "id", "name", "type" FROM "Room";
DROP TABLE "Room";
ALTER TABLE "new_Room" RENAME TO "Room";
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");
CREATE TABLE "new_RoomFeature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);
INSERT INTO "new_RoomFeature" ("id", "name") SELECT "id", "name" FROM "RoomFeature";
DROP TABLE "RoomFeature";
ALTER TABLE "new_RoomFeature" RENAME TO "RoomFeature";
CREATE UNIQUE INDEX "RoomFeature_name_key" ON "RoomFeature"("name");
CREATE TABLE "new_Rule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "severity" TEXT NOT NULL DEFAULT 'ERRO',
    "parameters" TEXT
);
INSERT INTO "new_Rule" ("code", "description", "id", "isActive", "name", "parameters", "severity") SELECT "code", "description", "id", "isActive", "name", "parameters", "severity" FROM "Rule";
DROP TABLE "Rule";
ALTER TABLE "new_Rule" RENAME TO "Rule";
CREATE UNIQUE INDEX "Rule_code_key" ON "Rule"("code");
CREATE TABLE "new_Schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Schedule" ("createdAt", "id", "isMain", "name", "updatedAt") SELECT "createdAt", "id", "isMain", "name", "updatedAt" FROM "Schedule";
DROP TABLE "Schedule";
ALTER TABLE "new_Schedule" RENAME TO "Schedule";
CREATE TABLE "new_Shift" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "type" TEXT,
    "enrolledStudents" INTEGER NOT NULL,
    "roomTypeReq" TEXT,
    "courseId" INTEGER NOT NULL,
    "parentShiftId" INTEGER,
    CONSTRAINT "Shift_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Shift_parentShiftId_fkey" FOREIGN KEY ("parentShiftId") REFERENCES "Shift" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Shift" ("courseId", "enrolledStudents", "id", "name", "parentShiftId", "roomTypeReq", "type") SELECT "courseId", "enrolledStudents", "id", "name", "parentShiftId", "roomTypeReq", "type" FROM "Shift";
DROP TABLE "Shift";
ALTER TABLE "new_Shift" RENAME TO "Shift";
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT'
);
INSERT INTO "new_User" ("email", "id", "name", "password", "role") SELECT "email", "id", "name", "password", "role" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE TABLE "new_Violation" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "ruleCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduleId" INTEGER NOT NULL,
    "lessonId" INTEGER NOT NULL,
    "relatedLessonId" INTEGER,
    CONSTRAINT "Violation_ruleCode_fkey" FOREIGN KEY ("ruleCode") REFERENCES "Rule" ("code") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "Violation_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES "Schedule" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Violation_lessonId_fkey" FOREIGN KEY ("lessonId") REFERENCES "Lesson" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Violation_relatedLessonId_fkey" FOREIGN KEY ("relatedLessonId") REFERENCES "Lesson" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_Violation" ("createdAt", "description", "id", "lessonId", "relatedLessonId", "ruleCode", "scheduleId", "severity") SELECT "createdAt", "description", "id", "lessonId", "relatedLessonId", "ruleCode", "scheduleId", "severity" FROM "Violation";
DROP TABLE "Violation";
ALTER TABLE "new_Violation" RENAME TO "Violation";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
