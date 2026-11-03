import { PrismaClient } from '@prisma/client';
import { getAuditActorId } from './audit-context';

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (!globalForPrisma.prisma) {
    prisma.$use(async (params, next) => {
        const action = params.action?.toUpperCase();
        const updateData = params.args?.data;
        const updatesCreatedAt = updateData && typeof updateData === 'object' && 'created_at' in updateData;

        if (updatesCreatedAt && ['UPDATE', 'UPDATEMANY', 'UPSERT'].includes(action ?? '')) {
            throw new Error('created_at só pode ser definido durante a criação e não pode ser alterado.');
        }

        const result = await next(params);
        const auditedActions = new Set(['CREATE', 'CREATEMANY', 'UPDATE', 'UPDATEMANY', 'DELETE', 'DELETEMANY', 'UPSERT']);

        if (params.model && params.model !== 'Log' && params.model !== 'Session' && action && auditedActions.has(action)) {
            await prisma.log.create({
                data: {
                    action,
                    entity: params.model,
                    created_by: getAuditActorId(),
                    updated_by: getAuditActorId(),
                },
            });
        }

        return result;
    });
}

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
