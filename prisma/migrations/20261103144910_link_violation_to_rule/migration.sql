-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Violation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "description" TEXT NOT NULL,
    "severity" TEXT NOT NULL,
    "ruleCode" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "scheduleId" TEXT NOT NULL,
    "lessonId" TEXT NOT NULL,
    "relatedLessonId" TEXT,
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
