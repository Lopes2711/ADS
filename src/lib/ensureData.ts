import { prisma } from './prisma';
import { seedDatabase } from './seed';

let hasChecked = false;

export async function ensureDataSeeded() {
  if (hasChecked) return;
  try {
    const courseCount = await prisma.course.count();
    if (courseCount === 0) {
      await seedDatabase();
    }
    hasChecked = true;
  } catch (error) {
    console.error('Error ensuring database is seeded:', error);
  }
}
