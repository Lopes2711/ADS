PRAGMA foreign_keys=OFF;

ALTER TABLE "User" ADD COLUMN "asked_role" TEXT;

ALTER TABLE "Schedule" RENAME COLUMN "isMain" TO "is_main";
ALTER TABLE "Schedule" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Schedule" RENAME COLUMN "updatedAt" TO "updated_at";

ALTER TABLE "Professor" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "ProfessorUnavailability" RENAME TO "Professor_Unavailability";
ALTER TABLE "Professor_Unavailability" RENAME COLUMN "dayOfWeek" TO "day_of_week";
ALTER TABLE "Professor_Unavailability" RENAME COLUMN "startTime" TO "start_time";
ALTER TABLE "Professor_Unavailability" RENAME COLUMN "endTime" TO "end_time";
ALTER TABLE "Professor_Unavailability" RENAME COLUMN "professorId" TO "professor_id";

ALTER TABLE "Shift" RENAME COLUMN "enrolledStudents" TO "enrolled_students";
ALTER TABLE "Shift" RENAME COLUMN "roomTypeReq" TO "room_type_req";
ALTER TABLE "Shift" RENAME COLUMN "courseId" TO "course_id";
ALTER TABLE "Shift" RENAME COLUMN "parentShiftId" TO "parent_shift_id";

ALTER TABLE "Lesson" RENAME COLUMN "startTime" TO "start_time";
ALTER TABLE "Lesson" RENAME COLUMN "endTime" TO "end_time";
ALTER TABLE "Lesson" RENAME COLUMN "scheduleId" TO "schedule_id";
ALTER TABLE "Lesson" RENAME COLUMN "shiftId" TO "shift_id";
ALTER TABLE "Lesson" RENAME COLUMN "roomId" TO "room_id";
ALTER TABLE "Lesson" RENAME COLUMN "professorId" TO "professor_id";

ALTER TABLE "Rule" RENAME COLUMN "isActive" TO "is_active";

ALTER TABLE "Violation" RENAME COLUMN "ruleCode" TO "rule_code";
ALTER TABLE "Violation" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Violation" RENAME COLUMN "scheduleId" TO "schedule_id";
ALTER TABLE "Violation" RENAME COLUMN "lessonId" TO "lesson_id";
ALTER TABLE "Violation" RENAME COLUMN "relatedLessonId" TO "related_lesson_id";

ALTER TABLE "Log" RENAME COLUMN "createdAt" TO "created_at";
ALTER TABLE "Log" RENAME COLUMN "updatedAt" TO "updated_at";
ALTER TABLE "Log" RENAME COLUMN "createdBy" TO "created_by";
ALTER TABLE "Log" RENAME COLUMN "updatedBy" TO "updated_by";

ALTER TABLE "Session" RENAME COLUMN "userId" TO "user_id";
ALTER TABLE "Session" RENAME COLUMN "expiresAt" TO "expires_at";
ALTER TABLE "Session" RENAME COLUMN "createdAt" TO "created_at";

ALTER TABLE "RoomFeature" RENAME TO "Room_Feature";

CREATE TABLE "Role_Managment" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "user_id" INTEGER NOT NULL,
    "requested_role" TEXT NOT NULL,
    CONSTRAINT "Role_Managment_user_id_fkey"
      FOREIGN KEY ("user_id") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE UNIQUE INDEX "Role_Managment_user_id_key" ON "Role_Managment"("user_id");

PRAGMA foreign_keys=ON;
