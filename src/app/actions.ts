'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function createUser(formData: FormData) {
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;

    if (!email) return;

    await prisma.user.create({
        data: {
            name,
            email,
        },
    });

    // Refresh the UI automatically
    revalidatePath('/');
}