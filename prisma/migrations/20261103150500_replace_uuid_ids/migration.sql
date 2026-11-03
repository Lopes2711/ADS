-- Reset the local development schema before recreating all IDs as integers.
PRAGMA foreign_keys=OFF;
DROP TABLE IF EXISTS "_ShiftRequiredFeatures";
DROP TABLE IF EXISTS "_RoomFeatures";
DROP TABLE IF EXISTS "Violation";
DROP TABLE IF EXISTS "Lesson";
DROP TABLE IF EXISTS "ProfessorUnavailability";
DROP TABLE IF EXISTS "Shift";
DROP TABLE IF EXISTS "RoomFeature";
DROP TABLE IF EXISTS "Room";
DROP TABLE IF EXISTS "Professor";
DROP TABLE IF EXISTS "Course";
DROP TABLE IF EXISTS "Schedule";
DROP TABLE IF EXISTS "Rule";
DROP TABLE IF EXISTS "User";
-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'STUDENT',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Schedule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "isMain" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "Course" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "acronym" TEXT NOT NULL,
    "degree" TEXT,
    "year" INTEGER,
    "semester" INTEGER
);

-- CreateTable
CREATE TABLE "Professor" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "userId" INTEGER,
    CONSTRAINT "Professor_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ProfessorUnavailability" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "dayOfWeek" INTEGER NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "professorId" INTEGER NOT NULL,
    CONSTRAINT "ProfessorUnavailability_professorId_fkey" FOREIGN KEY ("professorId") REFERENCES "Professor" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Shift" (
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

-- CreateTable
CREATE TABLE "Room" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "building" TEXT,
    "capacity" INTEGER NOT NULL,
    "type" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "RoomFeature" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Lesson" (
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

-- CreateTable
CREATE TABLE "Rule" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "severity" TEXT NOT NULL DEFAULT 'ERRO',
    "parameters" TEXT
);

-- CreateTable
CREATE TABLE "Violation" (
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

-- CreateTable
CREATE TABLE "_RoomFeatures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_RoomFeatures_A_fkey" FOREIGN KEY ("A") REFERENCES "Room" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_RoomFeatures_B_fkey" FOREIGN KEY ("B") REFERENCES "RoomFeature" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "_ShiftRequiredFeatures" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_ShiftRequiredFeatures_A_fkey" FOREIGN KEY ("A") REFERENCES "RoomFeature" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_ShiftRequiredFeatures_B_fkey" FOREIGN KEY ("B") REFERENCES "Shift" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Course_acronym_key" ON "Course"("acronym");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_email_key" ON "Professor"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Professor_userId_key" ON "Professor"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Room_name_key" ON "Room"("name");

-- CreateIndex
CREATE UNIQUE INDEX "RoomFeature_name_key" ON "RoomFeature"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Rule_code_key" ON "Rule"("code");

-- CreateIndex
CREATE UNIQUE INDEX "_RoomFeatures_AB_unique" ON "_RoomFeatures"("A", "B");

-- CreateIndex
CREATE INDEX "_RoomFeatures_B_index" ON "_RoomFeatures"("B");

-- CreateIndex
CREATE UNIQUE INDEX "_ShiftRequiredFeatures_AB_unique" ON "_ShiftRequiredFeatures"("A", "B");

-- CreateIndex
CREATE INDEX "_ShiftRequiredFeatures_B_index" ON "_ShiftRequiredFeatures"("B");


PRAGMA foreign_keys=ON;
